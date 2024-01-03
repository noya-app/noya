import {
  RelativeDropPosition,
  Select,
  Stack,
  TreeView,
  useDesignSystemTheme,
} from '@noya-app/noya-designsystem';
import { Sketch } from '@noya-app/noya-file-format';
import { isDeepEqual, upperFirst, uuid } from '@noya-app/noya-utils';
import { useApplicationState } from 'noya-app-state-context';
import { InspectorPrimitives } from 'noya-inspector';
import { SketchModel } from 'noya-sketch-model';
import {
  Action,
  Layers,
  OverriddenBlockContent,
  Selectors,
  createOverrideHierarchy,
  getSiblingBlocks,
} from 'noya-state';
import React, { useCallback } from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { BlockPreviewProps } from '../../../docs/InteractiveBlockPreview';
import { usePersistentState } from '../../../utils/clientStorage';
import { inferBlockTypes } from '../../infer/inferBlock';
import { boxSymbolId } from '../../symbols/symbolIds';
import { AyonLayerListRow } from './AyonLayerListRow';
import { InspectorCarousel } from './InspectorCarousel';

export function AyonLayerInspector({
  setOverriddenBlock,
  selectedLayer,
}: {
  selectedLayer: Sketch.SymbolInstance;
  setOverriddenBlock: (
    overriddenBlock: OverriddenBlockContent | undefined,
  ) => void;
}) {
  const [state, dispatch] = useApplicationState();

  const onSetOverriddenBlock = useCallback(
    (item: BlockPreviewProps | undefined) => {
      if (item) {
        setOverriddenBlock({
          layerId: selectedLayer.do_objectID,
          blockContent: {
            symbolId: item.symbolId,
            blockText: item.blockText,
            overrides: item.overrideValues,
            blockParameters: item.blockParameters,
          },
        });
      } else {
        setOverriddenBlock(undefined);
      }
    },
    [selectedLayer.do_objectID, setOverriddenBlock],
  );

  // const handleHoverBlockItem = useCallback(
  //   (item: CompletionItem | undefined) => {
  //     onSetOverriddenBlock(
  //       item
  //         ? {
  //             symbolId: item.id,
  //             blockText: selectedLayer.blockText,
  //             overrideValues: selectedLayer.overrideValues,
  //             resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
  //           }
  //         : undefined,
  //     );
  //   },
  //   [
  //     onSetOverriddenBlock,
  //     selectedLayer.blockText,
  //     selectedLayer.overrideValues,
  //     selectedLayer.resolvedBlockData?.resolvedText,
  //   ],
  // );

  // useKeyboardShortcuts({
  //   '/': () => {
  //     componentSearchInputRef.current?.focus();
  //   },
  //   '#': () => {
  //     styleSearchInputRef.current?.focus();
  //   },
  //   '+': () => {
  //     nestedComponentSearchInputRef.current?.focus();
  //   },
  // });

  const getSymbolMaster = useCallback(
    (symbolId: string) => Selectors.getSymbolMaster(state, symbolId),
    [state],
  );
  const master = getSymbolMaster(selectedLayer.symbolID);
  const componentName = master.name;
  const blockTypes = inferBlockTypes({
    frame: selectedLayer.frame,
    blockText: selectedLayer.blockText,
    siblingBlocks: getSiblingBlocks(state),
  });

  const parameters =
    selectedLayer.blockParameters ??
    master.blockDefinition?.placeholderParameters;

  const relatedBlocks: BlockPreviewProps[] = [
    {
      name: componentName,
      symbolId: selectedLayer.symbolID,
      blockText: selectedLayer.blockText,
      blockParameters: parameters,
      overrideValues: selectedLayer.overrideValues,
      resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
    },
    ...blockTypes
      .flatMap(({ type }) => (typeof type === 'string' ? [] : type.symbolId))
      .filter(
        (symbolId) =>
          symbolId !== boxSymbolId && symbolId !== selectedLayer.symbolID,
      )
      .slice(0, 2)
      .map(
        (symbolId): BlockPreviewProps => ({
          name: getSymbolMaster(symbolId).name,
          symbolId: symbolId,
          blockText: selectedLayer.blockText,
          blockParameters: parameters,
          overrideValues: selectedLayer.overrideValues.filter(
            (override) => !override.overrideName.endsWith('layers'),
          ),
          resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
        }),
      ),
  ];

  const presetStyles: BlockPreviewProps[] =
    master.blockDefinition?.stylePresets?.map((preset) => ({
      name: componentName,
      symbolId: selectedLayer.symbolID,
      blockText: selectedLayer.blockText,
      blockParameters: preset.parameters,
      overrideValues: selectedLayer.overrideValues,
      resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
    })) ?? [];

  type LayerTreeItem = {
    instance: Sketch.SymbolInstance;
    depth: number;
    path: string[];
    indexPath: number[];
  };

  const Hierarchy = createOverrideHierarchy(state);

  const [inspectorMode, setInspectorMode] = usePersistentState<
    'compact' | 'advanced'
  >('ayonLayerInspectorView', 'compact');

  const flattened = Hierarchy.flatMap(
    selectedLayer,
    (layer, indexPath): LayerTreeItem[] => {
      if (!Layers.isSymbolInstance(layer)) return [];

      const depth = indexPath.length;

      if (
        depth !== 0 &&
        inspectorMode === 'compact' &&
        !getSymbolMaster(layer.symbolID).blockDefinition?.supportsBlockText
      ) {
        return [];
      }

      return [
        {
          instance: layer,
          depth,
          indexPath: indexPath.slice(),
          path: Hierarchy.accessPath(selectedLayer, indexPath)
            .slice(1)
            .map((layer) => layer.do_objectID),
        },
      ];
    },
  );

  const setAllOverrides = (updatedLayer: Sketch.SymbolInstance) => {
    const actions = updatedLayer.overrideValues
      .filter((override) => override.overrideName.endsWith('layers'))
      .map((override): Action => {
        return [
          'setOverrideValue',
          [updatedLayer.do_objectID],
          override.overrideName,
          override.value,
        ];
      });

    dispatch('batch', actions);
  };

  const theme = useDesignSystemTheme();

  return (
    <Stack.V
      gap="1px"
      position="relative"
      background={theme.colors.canvas.background}
    >
      <InspectorSection title={componentName} titleTextStyle="heading3">
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>
            Related Components
          </InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorCarousel
          key={selectedLayer.symbolID}
          items={[]}
          selectedIndex={0}
          onSelectItem={(index) => {
            dispatch(
              'setSymbolInstanceSource',
              relatedBlocks[index].symbolId,
              'preserveCurrent',
            );
          }}
          onHoverItemChange={(index, isHovering) => {
            onSetOverriddenBlock(isHovering ? relatedBlocks[index] : undefined);
          }}
        />
        {presetStyles.length > 0 && (
          <>
            <InspectorPrimitives.SectionHeader>
              <InspectorPrimitives.Title>Presets</InspectorPrimitives.Title>
            </InspectorPrimitives.SectionHeader>
            <InspectorCarousel
              items={[]}
              selectedIndex={presetStyles.findIndex((style) =>
                isDeepEqual(style.blockParameters, parameters),
              )}
              onSelectItem={(index) => {
                dispatch(
                  'setBlockParameters',
                  undefined,
                  presetStyles[index].blockParameters ?? [],
                );
              }}
              onHoverItemChange={(index, isHovering) => {
                onSetOverriddenBlock(
                  isHovering ? presetStyles[index] : undefined,
                );
              }}
            />
          </>
        )}
      </InspectorSection>
      <InspectorSection
        title="Content"
        titleTextStyle="heading4"
        right={
          <Stack.H width="130px">
            <Select<'compact' | 'advanced'>
              id="inspector-mode"
              value={inspectorMode}
              onChange={setInspectorMode}
              getTitle={(title) => `${upperFirst(title)} View`}
              options={['compact', 'advanced']}
            />
          </Stack.H>
        }
      >
        <TreeView.Root
          keyExtractor={({ instance: layer }) => layer.do_objectID}
          data={flattened}
          expandable={false}
          variant="bare"
          indentation={inspectorMode === 'advanced' ? 24 : 0}
          sortable={inspectorMode === 'advanced'}
          pressEventName="onPointerDown"
          acceptsDrop={(
            sourceIndex: number,
            destinationIndex: number,
            relationDropPosition: RelativeDropPosition,
          ) => {
            const sourceId = flattened[sourceIndex].instance.do_objectID;
            const destinationId =
              flattened[destinationIndex].instance.do_objectID;
            const sourcePaths = Hierarchy.findAllIndexPaths(
              selectedLayer,
              (layer) => sourceId === layer.do_objectID,
            );
            const destinationPath = Hierarchy.findIndexPath(
              selectedLayer,
              (layer) => layer.do_objectID === destinationId,
            );

            if (sourcePaths.length === 0 || !destinationPath) return false;

            // Don't allow dragging above or below the root
            if (
              destinationPath.length === 0 &&
              relationDropPosition !== 'inside'
            )
              return false;

            // Don't allow dragging into a descendant
            if (
              sourcePaths.some((sourcePath) =>
                isDeepEqual(
                  sourcePath,
                  destinationPath.slice(0, sourcePath.length),
                ),
              )
            )
              return false;

            // const sourceLayers = sourcePaths.map((sourcePath) =>
            //   Hierarchy.access(selectedLayer, sourcePath),
            // );

            const destinationLayer = Hierarchy.access(
              selectedLayer,
              destinationPath,
            );

            const destinationExpanded =
              destinationLayer.layerListExpandedType !==
              Sketch.LayerListExpanded.Collapsed;

            // Don't allow dragging below expanded layers - we'll fall back to inside
            if (
              destinationExpanded &&
              Layers.isParentLayer(destinationLayer) &&
              destinationLayer.layers.length > 0 &&
              relationDropPosition === 'below'
            ) {
              return false;
            }

            // // Only allow dropping inside of parent layers
            // if (
            //   relationDropPosition === 'inside' &&
            //   !Layers.isParentLayer(destinationLayer)
            // ) {
            //   return false;
            // }

            return true;
          }}
          onMoveItem={(
            sourceIndex: number,
            destinationIndex: number,
            position: RelativeDropPosition,
          ) => {
            const sourceItem = flattened[sourceIndex];
            const destinationItem = flattened[destinationIndex];

            function applyUpdate() {
              switch (position) {
                case 'above': {
                  return Hierarchy.move(selectedLayer, {
                    indexPaths: [sourceItem.indexPath],
                    to: destinationItem.indexPath,
                  });
                }
                case 'below': {
                  return Hierarchy.move(selectedLayer, {
                    indexPaths: [sourceItem.indexPath],
                    to: [
                      ...destinationItem.indexPath.slice(0, -1),
                      destinationItem.indexPath.at(-1)! + 1,
                    ],
                  });
                }
                case 'inside': {
                  return Hierarchy.move(selectedLayer, {
                    indexPaths: [sourceItem.indexPath],
                    to: [...destinationItem.indexPath, 0],
                  });
                }
              }
            }

            const updated = applyUpdate();

            setAllOverrides(updated);
          }}
          renderItem={(
            { instance: layer, depth, path, indexPath },
            index,
            { isDragging },
          ) => {
            const key = path.join('/');

            return (
              <AyonLayerListRow
                key={key}
                layer={layer}
                depth={depth}
                path={path}
                isDragging={isDragging}
                onSetOverriddenBlock={onSetOverriddenBlock}
                inspectorMode={inspectorMode}
                onDelete={() => {
                  const updated = Hierarchy.remove(selectedLayer, {
                    indexPaths: [indexPath],
                  });

                  setAllOverrides(updated);
                }}
                onDuplicate={() => {
                  const updated = Hierarchy.insert(selectedLayer, {
                    at: indexPath,
                    nodes: [
                      Layers.map(layer, (child) => {
                        return {
                          ...child,
                          do_objectID: uuid(),
                        };
                      }),
                    ],
                  });

                  setAllOverrides(updated);
                }}
                onInsertChild={() => {
                  const updated = Hierarchy.insert(selectedLayer, {
                    at: [
                      ...indexPath,
                      Hierarchy.getChildren(selectedLayer, indexPath).length,
                    ],
                    nodes: [
                      SketchModel.symbolInstance({
                        symbolID: boxSymbolId,
                        name: 'Box',
                      }),
                    ],
                  });

                  setAllOverrides(updated);
                }}
              />
            );
          }}
        />
      </InspectorSection>
    </Stack.V>
  );
}
