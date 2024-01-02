import { Sketch } from '@noya-app/noya-file-format';
import { uuid } from '@noya-app/noya-utils';
import {
  EnhancedGeneratedPageName,
  useGeneratedPageComponentNames,
  useNoyaClientOrFallback,
} from 'noya-api';
import { useWorkspace } from 'noya-app-state-context';
import {
  ExtractMenuItemType,
  ListView,
  RelativeDropPosition,
  SEPARATOR_ITEM,
  createSectionedMenu,
} from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import { SketchModel } from 'noya-sketch-model';
import { Layers } from 'noya-state';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { DEFAULT_DESIGN_SYSTEM } from '../../../components/DSContext';
import { InspectorSection } from '../../../components/InspectorSection';
import { DSThemeInspector } from '../../../dseditor/DSThemeInspector';
import { usePersistentState } from '../../../utils/clientStorage';
import { useAyonState } from '../../state/ayonState';
import { CustomLayerData } from '../../types';
import { AyonListRow, AyonListSectionHeader } from './AyonListPrimitives';
import { AyonPageSizeInspectorRow } from './AyonPageSizeInspectorRow';
import { DesignSystemPicker } from './DesignSystemPicker';

interface Props {
  projectName: string;
  selectedArtboards: Sketch.Artboard[];
}

export const AyonPageInspector = function AyonPageInspector({
  projectName,
  selectedArtboards,
}: Props) {
  const [state, dispatch] = useAyonState();
  // const client = useNoyaClientOrFallback();
  // const projectDescription = state.sketch.meta.noya?.projectDescription ?? '';
  const firstArtboard = selectedArtboards[0];
  // const layers = firstArtboard.layers.filter(
  //   Layers.isCustomLayer<CustomLayerData>,
  // );
  // const existingComponentNames = layers.map((layer) => layer.name);

  // useEffect(() => {
  //   client.generate.pageComponentNames({
  //     projectName,
  //     projectDescription,
  //     existingComponentNames,
  //     pageName: firstArtboard.name,
  //   });
  // }, [
  //   client,
  //   existingComponentNames,
  //   firstArtboard.name,
  //   projectDescription,
  //   projectName,
  // ]);

  return (
    <>
      <InspectorSection title="Page" titleTextStyle="heading3">
        <AyonPageSizeInspectorRow artboard={firstArtboard} />
      </InspectorSection>
      <InspectorSection title="Theme" titleTextStyle="heading3">
        <InspectorPrimitives.LabeledRow label="Design System">
          <DesignSystemPicker />
        </InspectorPrimitives.LabeledRow>
        <DSThemeInspector
          dsConfig={
            (state.sketch.document.designSystem ?? DEFAULT_DESIGN_SYSTEM).config
          }
          onChangeDSConfig={(config) => {
            dispatch('setDesignSystemConfig', config);
          }}
        />
      </InspectorSection>
      {/* {selectedArtboards.length === 1 && (
        <InspectorSection title="Components" titleTextStyle="heading3">
          <AyonPageComponentList
            selectedArtboard={firstArtboard}
            projectName={projectName}
            projectDescription={projectDescription}
            existingComponentNames={existingComponentNames}
          />
        </InspectorSection>
      )} */}
    </>
  );
};

export const AyonPageComponentList = function AyonPageComponentList({
  selectedArtboard,
  projectName,
  projectDescription,
  existingComponentNames,
}: {
  selectedArtboard: Sketch.Artboard;
  projectName: string;
  projectDescription: string;
  existingComponentNames: string[];
}) {
  const layers = selectedArtboard.layers.filter(
    Layers.isCustomLayer<CustomLayerData>,
  );
  const client = useNoyaClientOrFallback();
  const [state, dispatch] = useAyonState();
  const { startRenamingLayer, renamingLayer, didHandleFocus } = useWorkspace();
  const selectedLayerIds = state.selectedLayerIds;
  const [editingLayer, setEditingLayer] = useState<string | undefined>();
  const [hoveredLayer, setHoveredLayer] = useState<string | undefined>();

  const generatedPageNames = useGeneratedPageComponentNames();
  const [suggestionMode, setSuggestionMode] = usePersistentState<
    'show' | 'hide'
  >('ayonShowComponentSuggestions', 'show');

  useLayoutEffect(() => {
    if (!renamingLayer) return;

    setTimeout(() => {
      setEditingLayer(renamingLayer);
      didHandleFocus();
    }, 50);
  }, [didHandleFocus, renamingLayer]);

  const data = useMemo(
    () => [
      ...layers,
      SEPARATOR_ITEM,
      ...(suggestionMode === 'show' ? generatedPageNames : []),
    ],
    [layers, generatedPageNames, suggestionMode],
  );

  function createLayerForSuggestion(options: EnhancedGeneratedPageName) {
    const { name, width = 100, height = 100 } = options;

    const layer = SketchModel.customLayer<CustomLayerData>({
      do_objectID: uuid(),
      name,
      frame: SketchModel.rect({ width, height }),
      data: {
        // node: Model.primitiveElement({
        //   componentID: boxSymbolId,
        //   classNames: Model.classNames(['flex-1']),
        // }),
      },
    });

    return layer;
  }

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
          const destinationId = layers[destinationIndex].do_objectID;

          // 'moveLayer' assumes a reversed array, so we need to reverse the position
          const reversedPosition = position === 'below' ? 'above' : 'below';

          // If sourceIndex is greater than the number of artboards, it's a generated page
          if (sourceIndex >= layers.length) {
            const suggestion = data[sourceIndex] as EnhancedGeneratedPageName;

            // Accept the generation
            client.random.resetPageComponentName(suggestion.index, 'accept', {
              projectName,
              projectDescription,
              existingComponentNames,
              pageName: selectedArtboard.name,
            });

            const layer = createLayerForSuggestion(suggestion);

            dispatch('batch', [
              ['addLayer', layer],
              // Move layer inside artboard
              [
                'moveLayer',
                layer.do_objectID,
                selectedArtboard.do_objectID,
                'inside',
              ],
            ]);

            return;
          }

          const sourceId = layers[sourceIndex].do_objectID;

          dispatch('moveLayer', sourceId, destinationId, reversedPosition);
        },
        [
          layers,
          dispatch,
          data,
          client,
          projectName,
          projectDescription,
          existingComponentNames,
          selectedArtboard.name,
          selectedArtboard.do_objectID,
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
              Suggested Components
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
            // onPress={() => {
            //   if (isSuggestedPage) return;
            //   dispatch('batch', [
            //     ['selectLayer', id],
            //     ['zoomToFit*', { type: 'layer', value: id }, { padding: 20 }],
            //   ]);
            // }}
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
              if (!('type' in artboard)) return;

              client.random.resetPageComponentName(index, 'accept', {
                projectName,
                projectDescription,
                existingComponentNames,
                pageName: selectedArtboard.name,
              });

              dispatch('insertPageComponent', {
                name: artboard.name,
                width: artboard.width || 200,
                height: artboard.height || 200,
              });
            }}
            onClickTrash={() => {
              client.random.resetPageComponentName(index, 'reject', {
                projectName,
                projectDescription,
                existingComponentNames,
                pageName: selectedArtboard.name,
              });
            }}
          />
        );
      }}
    />
  );
};
