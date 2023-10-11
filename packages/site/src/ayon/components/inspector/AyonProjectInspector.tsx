import {
  EnhancedGeneratedPageName,
  useGeneratedPageNames,
  useNoyaClientOrFallback,
} from 'noya-api';
import { useWorkspace } from 'noya-app-state-context';
import {
  ActivityIndicator,
  Button,
  ExtractMenuItemType,
  IconButton,
  InputField,
  ListView,
  RelativeDropPosition,
  SEPARATOR_ITEM,
  Spacer,
  Stack,
  Text,
  createSectionedMenu,
  useDesignSystemTheme,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { PlusIcon } from 'noya-icons';
import { InspectorPrimitives } from 'noya-inspector';
import { Layers, Selectors } from 'noya-state';
import { debounce, uuid } from 'noya-utils';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_DESIGN_SYSTEM } from '../../../components/DSContext';
import { InspectorSection } from '../../../components/InspectorSection';
import { DSThemeInspector } from '../../../dseditor/DSThemeInspector';
import { usePersistentState } from '../../../utils/clientStorage';
import { useAyonState } from '../../state/ayonState';
import { DescriptionTextArea, useAutoResize } from './DescriptionTextArea';
import { DesignSystemPicker } from './DesignSystemPicker';
import { DraggableMenuButton } from './DraggableMenuButton';

const noop = () => {};

export function AyonProjectInspector({
  name,
  onChangeName = noop,
}: {
  name: string;
  onChangeName?: (name: string) => void;
}) {
  const client = useNoyaClientOrFallback();

  const theme = useDesignSystemTheme();
  const { startRenamingLayer } = useWorkspace();
  const [state, dispatch] = useAyonState();

  const currentDesignSystem =
    state.sketch.document.designSystem ?? DEFAULT_DESIGN_SYSTEM;

  const existingPageNames = Selectors.getCurrentPage(state)
    .layers.filter(Layers.isArtboard)
    .map((artboard) => artboard.name);

  const projectDescription = state.sketch.meta.noya?.projectDescription ?? '';
  const descriptionRef = useAutoResize(projectDescription);

  useEffect(() => {
    client.generate.pageNames({
      projectName: name,
      projectDescription,
      existingPageNames,
    });
  }, [client, existingPageNames, name, projectDescription]);

  const handleChangeDescriptionDebounced = useMemo(
    () =>
      debounce((event: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch('setProjectDescription', event.target.value);
      }, 300),
    [dispatch],
  );

  return (
    <>
      <InspectorSection title="Project" titleTextStyle="heading3">
        <InspectorPrimitives.LabeledRow label="Name">
          <InputField.Root>
            <InputField.Input
              value={name}
              onSubmit={onChangeName}
              placeholder="Untitled"
              allowSubmittingWithSameValue
              submitAutomaticallyAfterDelay={300}
            />
          </InputField.Root>
        </InspectorPrimitives.LabeledRow>
        <InspectorPrimitives.LabeledRow label="Description">
          <DescriptionTextArea
            ref={descriptionRef}
            defaultValue={projectDescription}
            placeholder="An app where users can..."
            onChange={handleChangeDescriptionDebounced}
          />
        </InspectorPrimitives.LabeledRow>
      </InspectorSection>
      <InspectorSection
        title="Pages"
        titleTextStyle="heading4"
        right={
          <Button
            onClick={() => {
              const newArtboardId = uuid();
              dispatch('insertArtboardAndFocus', {
                name: 'Page',
                layerId: newArtboardId,
              });
              startRenamingLayer(newArtboardId);
            }}
          >
            <PlusIcon color={theme.colors.icon} />
            <Spacer.Horizontal size={8} />
            New Page
          </Button>
        }
      >
        <AyonArtboardList
          projectName={name}
          projectDescription={projectDescription}
          existingPageNames={existingPageNames}
        />
      </InspectorSection>
      <InspectorSection title="Theme" titleTextStyle="heading4">
        <InspectorPrimitives.LabeledRow label="Design System">
          <DesignSystemPicker />
        </InspectorPrimitives.LabeledRow>
        <DSThemeInspector
          dsConfig={currentDesignSystem.config}
          onChangeDSConfig={(config) => {
            dispatch('setDesignSystemConfig', config);
          }}
        />
      </InspectorSection>
    </>
  );
}

function AyonArtboardList({
  projectName,
  projectDescription,
  existingPageNames,
}: {
  projectName: string;
  projectDescription: string;
  existingPageNames: string[];
}) {
  const client = useNoyaClientOrFallback();
  const [state, dispatch] = useAyonState();
  const theme = useDesignSystemTheme();
  const { startRenamingLayer, renamingLayer, didHandleFocus } = useWorkspace();
  const artboards = Selectors.getCurrentPage(state).layers.filter(
    Layers.isArtboard,
  );
  const selectedLayerIds = state.selectedLayerIds;
  const [editingLayer, setEditingLayer] = useState<string | undefined>();

  const generatedPageNames = useGeneratedPageNames();
  const [suggestionMode, setSuggestionMode] = usePersistentState<
    'show' | 'hide'
  >('ayonShowPageSuggestions', 'show');

  useLayoutEffect(() => {
    if (!renamingLayer) return;

    setTimeout(() => {
      setEditingLayer(renamingLayer);
      didHandleFocus();
    }, 50);
  }, [didHandleFocus, renamingLayer]);

  const data = useMemo(
    () => [
      ...artboards,
      SEPARATOR_ITEM,
      ...(suggestionMode === 'show' ? generatedPageNames : []),
    ],
    [artboards, generatedPageNames, suggestionMode],
  );

  return (
    <ListView.Root
      data={data}
      sortable
      variant="bare"
      keyExtractor={(artboard) =>
        typeof artboard === 'string'
          ? artboard
          : 'type' in artboard
          ? artboard.index.toString()
          : artboard.do_objectID
      }
      sectionHeaderVariant="label"
      acceptsDrop={useCallback(
        (
          sourceId: string,
          destinationId: string,
          relationDropPosition: RelativeDropPosition,
        ) => {
          if (relationDropPosition === 'inside') return false;

          const destinationItem = data.find((item): item is Sketch.Artboard => {
            if (typeof item === 'string') return false;
            if ('type' in item) return false;
            return item.do_objectID === destinationId;
          });

          return !!destinationItem;
        },
        [data],
      )}
      onMoveItem={useCallback(
        (
          sourceIndex: number,
          destinationIndex: number,
          position: RelativeDropPosition,
        ) => {
          const destinationId = artboards[destinationIndex].do_objectID;

          // 'moveLayer' assumes a reversed array, so we need to reverse the position
          const reversedPosition = position === 'below' ? 'above' : 'below';

          // If sourceIndex is greater than the number of artboards, it's a generated page
          if (sourceIndex >= artboards.length) {
            const suggestion = data[sourceIndex] as EnhancedGeneratedPageName;

            // Accept the generation
            client.random.resetPageName(suggestion.index, 'accept', {
              projectName,
              projectDescription,
              existingPageNames,
            });
            dispatch('insertArtboardAndFocus', {
              name: suggestion.name,
              relativeTo: { id: destinationId, position: reversedPosition },
            });

            return;
          }

          const sourceId = artboards[sourceIndex].do_objectID;

          dispatch('moveLayer', sourceId, destinationId, reversedPosition);
        },
        [
          artboards,
          client,
          data,
          dispatch,
          existingPageNames,
          projectDescription,
          projectName,
        ],
      )}
      renderItem={(artboard, _, { isDragging }) => {
        if (typeof artboard === 'string') {
          return (
            <ListView.Row
              key={artboard}
              isSectionHeader
              backgroundColor="transparent"
              tabIndex={-1}
            >
              <Stack.H padding="12px 0 4px 0" gap="2px">
                <Text variant="label" color="textSubtle" fontWeight="bold">
                  Suggested Pages
                </Text>
                <IconButton
                  contentStyle={{
                    position: 'relative',
                    top: '-1px',
                    height: '12px',
                    margin: '-4px 0',
                  }}
                  iconName={
                    suggestionMode === 'show'
                      ? 'CaretDownIcon'
                      : 'CaretRightIcon'
                  }
                  onClick={() => {
                    setSuggestionMode(
                      suggestionMode === 'show' ? 'hide' : 'show',
                    );
                  }}
                />
              </Stack.H>
            </ListView.Row>
          );
        }
        // else if (typeof artboard === 'string') {
        //   return (
        //     <ListView.Row key={artboard} backgroundColor="transparent">
        //       <ListView.RowTitle>Hello</ListView.RowTitle>
        //     </ListView.Row>
        //   );
        // }

        const { id, name, isSuggestedPage, isLoading, index } =
          'type' in artboard
            ? {
                id: artboard.index.toString(),
                name: artboard.name,
                isSuggestedPage: true,
                isLoading: artboard.loading,
                index: artboard.index,
              }
            : {
                id: artboard.do_objectID,
                name: artboard.name,
                isSuggestedPage: false,
                isLoading: false,
                index: -1,
              };

        const isSelected = selectedLayerIds.includes(id);
        const isEditing = editingLayer === id;

        const menu = createSectionedMenu(
          [!isEditing && { value: 'rename', title: 'Rename' }],
          [
            !isEditing && { value: 'duplicate', title: 'Duplicate' },
            !isEditing && { value: 'delete', title: 'Delete' },
          ],
        );

        const handleSelect = (value: ExtractMenuItemType<(typeof menu)[0]>) => {
          switch (value) {
            case 'rename':
              startRenamingLayer(id);
              break;
            case 'duplicate':
              dispatch('duplicateLayer', [id]);
              break;
            case 'delete':
              dispatch('deleteLayer', id);
              break;
          }
        };

        const handleSubmitEditing = (name: string) => {
          setEditingLayer(undefined);

          if (!name) return;

          dispatch('setLayerName', id, name);
        };

        return (
          <ListView.Row
            key={id}
            id={id}
            depth={0}
            selected={isSelected}
            backgroundColor="transparent"
            menuItems={menu}
            onSelectMenuItem={handleSelect}
            onPress={() => {
              if (isSuggestedPage) return;
              dispatch('batch', [
                ['selectLayer', id],
                ['zoomToFit*', { type: 'layer', value: id }],
              ]);
            }}
            onDoubleClick={() => {
              if (isSuggestedPage) return;
              startRenamingLayer(id);
            }}
            disabled={isLoading}
          >
            <DraggableMenuButton
              isVisible
              items={menu}
              onSelect={handleSelect}
            />
            <Spacer.Horizontal size={8} />
            <Stack.V
              flex="1 1 0%"
              padding="1px"
              borderRadius="4px"
              margin="2px 0"
              gap="2px"
              border={`1px solid ${theme.colors.divider}`}
              color={'inherit'}
              background={isSelected ? theme.colors.primary : 'transparent'}
            >
              <Stack.H padding="4px 6px" alignItems="center" gap="4px">
                {isEditing ? (
                  <ListView.EditableRowTitle
                    autoFocus
                    value={name}
                    onSubmitEditing={handleSubmitEditing}
                  />
                ) : isLoading ? (
                  <>
                    <ListView.RowTitle>Loading...</ListView.RowTitle>
                    <ActivityIndicator opacity={0.5} />
                  </>
                ) : (
                  <ListView.RowTitle>{name}</ListView.RowTitle>
                )}
              </Stack.H>
            </Stack.V>
            {isSuggestedPage && !isLoading && !isDragging && (
              <>
                <Spacer.Horizontal size={8} />
                <IconButton
                  iconName="PlusIcon"
                  color={theme.colors.icon}
                  onClick={() => {
                    client.random.resetPageName(index, 'accept', {
                      projectName,
                      projectDescription,
                      existingPageNames,
                    });
                    dispatch('insertArtboardAndFocus', { name });
                  }}
                />
                <Spacer.Horizontal size={8} />
                <IconButton
                  iconName="TrashIcon"
                  color={theme.colors.icon}
                  onClick={() => {
                    client.random.resetPageName(index, 'reject', {
                      projectName,
                      projectDescription,
                      existingPageNames,
                    });
                  }}
                />
              </>
            )}
          </ListView.Row>
        );
      }}
    />
  );
}
