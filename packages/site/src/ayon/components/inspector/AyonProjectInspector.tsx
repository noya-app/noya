import { PlusIcon } from '@noya-app/noya-icons';
import { debounce, uuid } from '@noya-app/noya-utils';
import {
  EnhancedGeneratedPageName,
  useGeneratedPageNames,
  useNoyaClientOrFallback,
} from 'noya-api';
import { useWorkspace } from 'noya-app-state-context';
import {
  Button,
  ExtractMenuItemType,
  InputField,
  ListView,
  RelativeDropPosition,
  SEPARATOR_ITEM,
  Spacer,
  createSectionedMenu,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import { Layers, Selectors } from 'noya-state';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { usePersistentState } from '../../../utils/clientStorage';
import { useAyonState } from '../../state/ayonState';
import { AyonListRow, AyonListSectionHeader } from './AyonListPrimitives';
import { DescriptionTextArea, useAutoResize } from './DescriptionTextArea';

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
  const { startRenamingLayer, renamingLayer, didHandleFocus } = useWorkspace();
  const artboards = Selectors.getCurrentPage(state).layers.filter(
    Layers.isArtboard,
  );
  const selectedLayerIds = state.selectedLayerIds;
  const [editingLayer, setEditingLayer] = useState<string | undefined>();
  const [hoveredLayer, setHoveredLayer] = useState<string | undefined>();

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
        (sourceIndex, destinationIndex, position) => {
          if (position === 'inside') return false;
          const item = data[destinationIndex];
          if (!item || typeof item === 'string' || 'type' in item) return false;
          return true;
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
            <AyonListSectionHeader
              key={artboard}
              isExpanded={suggestionMode === 'show'}
              onChangeExpanded={(isExpanded) =>
                setSuggestionMode(isExpanded ? 'show' : 'hide')
              }
            >
              Suggested Pages
            </AyonListSectionHeader>
          );
        }

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
        const isHovered = hoveredLayer === id;

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
          <AyonListRow
            key={id}
            id={id}
            selected={isSelected}
            menuItems={menu}
            onHoverChange={(isHovered) => {
              if (isHovered) {
                setHoveredLayer(id);
              } else {
                setHoveredLayer(undefined);
              }
            }}
            onSelectMenuItem={handleSelect}
            onPress={() => {
              if (isSuggestedPage) return;
              dispatch('batch', [
                ['selectLayer', id],
                ['zoomToFit*', { type: 'layer', value: id }, { padding: 20 }],
              ]);
            }}
            onDoubleClick={() => {
              if (isSuggestedPage) return;
              startRenamingLayer(id);
            }}
            hovered={isHovered}
            isLoading={isLoading}
            isDragging={isDragging}
            isEditing={isEditing}
            name={name}
            isSuggestedPage={isSuggestedPage}
            handleSubmitEditing={handleSubmitEditing}
            onClickPlus={() => {
              client.random.resetPageName(index, 'accept', {
                projectName,
                projectDescription,
                existingPageNames,
              });
              dispatch('insertArtboardAndFocus', { name });
            }}
            onClickTrash={() => {
              client.random.resetPageName(index, 'reject', {
                projectName,
                projectDescription,
                existingPageNames,
              });
            }}
          />
        );
      }}
    />
  );
}
