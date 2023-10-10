import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import {
  Button,
  ExtractMenuItemType,
  IconButton,
  InputField,
  ListView,
  SEPARATOR_ITEM,
  Spacer,
  Stack,
  createSectionedMenu,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import { Layers, Selectors } from 'noya-state';
import { findLast, uuid } from 'noya-utils';
import React, { useLayoutEffect, useState } from 'react';
import { DEFAULT_DESIGN_SYSTEM } from '../../../components/DSContext';
import { InspectorSection } from '../../../components/InspectorSection';
import { DSThemeInspector } from '../../../dseditor/DSThemeInspector';
import { useAyonState } from '../../state/ayonState';
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
  const { startRenamingLayer } = useWorkspace();
  const [state, dispatch] = useApplicationState();

  const currentDesignSystem =
    state.sketch.document.designSystem ?? DEFAULT_DESIGN_SYSTEM;

  return (
    <>
      <InspectorSection title="Project" titleTextStyle="heading3">
        <InspectorPrimitives.LabeledRow label="Name">
          <InputField.Root>
            <InputField.Input
              value={name}
              onChange={onChangeName}
              placeholder="Untitled"
            />
          </InputField.Root>
        </InspectorPrimitives.LabeledRow>
      </InspectorSection>
      <InspectorSection
        title="Pages"
        titleTextStyle="heading4"
        right={
          <Button
            onClick={() => {
              const newArtboardId = uuid();

              const sizeOfLastArtboard = findLast(
                Selectors.getCurrentPage(state).layers,
                Layers.isArtboard,
              )?.frame ?? {
                width: 1280,
                height: 720,
              };

              dispatch('batch', [
                [
                  'insertArtboard',
                  {
                    name: 'Page',
                    id: newArtboardId,
                    width: sizeOfLastArtboard.width,
                    height: sizeOfLastArtboard.height,
                  },
                ],
                ['selectLayer', newArtboardId],
                ['zoomToFit*', { type: 'layer', value: newArtboardId }],
              ]);

              startRenamingLayer(newArtboardId);
            }}
          >
            <IconButton iconName="PlusIcon" />
            <Spacer.Horizontal size={8} />
            New Page
          </Button>
        }
      >
        <AyonArtboardList />
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

function AyonArtboardList() {
  const [state, dispatch] = useAyonState();
  const theme = useDesignSystemTheme();
  const { startRenamingLayer, renamingLayer, didHandleFocus } = useWorkspace();
  const artboards = Selectors.getCurrentPage(state).layers.filter(
    Layers.isArtboard,
  );
  const selectedLayerIds = state.selectedLayerIds;
  const [editingLayer, setEditingLayer] = useState<string | undefined>();

  useLayoutEffect(() => {
    if (!renamingLayer) return;

    setTimeout(() => {
      setEditingLayer(renamingLayer);
      didHandleFocus();
    }, 50);
  }, [didHandleFocus, renamingLayer]);

  const data = [...artboards, SEPARATOR_ITEM, 'Example'];

  return (
    <ListView.Root
      data={data}
      sortable
      variant="bare"
      keyExtractor={(artboard) =>
        typeof artboard === 'string' ? artboard : artboard.do_objectID
      }
      sectionHeaderVariant="label"
      // pressEventName="onPointerDown"
      renderItem={(artboard, _, { isDragging }) => {
        if (artboard === SEPARATOR_ITEM) {
          return (
            <ListView.Row
              key={artboard}
              isSectionHeader
              backgroundColor="transparent"
            >
              <Stack.H padding="12px 0 10px 0">
                <ListView.RowTitle>Suggested Pages</ListView.RowTitle>
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

        const id =
          typeof artboard === 'string' ? artboard : artboard.do_objectID;
        const name = typeof artboard === 'string' ? artboard : artboard.name;
        const isSuggestedPage = typeof artboard === 'string';

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
                ) : (
                  <ListView.RowTitle>{name}</ListView.RowTitle>
                )}
              </Stack.H>
            </Stack.V>
            {isSuggestedPage && !isDragging && (
              <>
                <Spacer.Horizontal size={8} />
                <IconButton iconName="PlusIcon" color={theme.colors.icon} />
                <Spacer.Horizontal size={8} />
                <IconButton iconName="TrashIcon" color={theme.colors.icon} />
              </>
            )}
          </ListView.Row>
        );
      }}
    />
  );
}
