import { useApplicationState } from 'noya-app-state-context';
import {
  RelativeDropPosition,
  Select,
  Stack,
  TreeView,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { InspectorPrimitives } from 'noya-inspector';
import {
  Action,
  Layers,
  OverriddenBlockContent,
  Selectors,
  createOverrideHierarchy,
  getSiblingBlocks,
} from 'noya-state';
import { isDeepEqual, upperFirst } from 'noya-utils';
import React, { useCallback } from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { BlockPreviewProps } from '../../../docs/InteractiveBlockPreview';
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

  const [inspectorMode, setInspectorMode] = React.useState<
    'compact' | 'advanced'
  >('compact');

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

  return (
    <Stack.V gap="1px" position="relative">
      <InspectorSection title={componentName} titleTextStyle="heading3">
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>
            Related Components
          </InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorCarousel
          key={selectedLayer.symbolID}
          items={relatedBlocks}
          selectedIndex={0}
          getSymbolMaster={getSymbolMaster}
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
              getSymbolMaster={getSymbolMaster}
              items={presetStyles}
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
          <Stack.H width="100px">
            <Select<'compact' | 'advanced'>
              id="inspector-mode"
              value={inspectorMode}
              onChange={setInspectorMode}
              getTitle={upperFirst}
              options={['compact', 'advanced']}
            />
          </Stack.H>
        }
      >
        {/* <InputFieldWithCompletions
          ref={nestedComponentSearchInputRef}
          size="large"
          placeholder={'Content'}
          items={blockCompletionItems}
          onSelectItem={(item) => {
            dispatch('setOverrideValue', undefined, 'layers', [
              ...Hierarchy.getChildren(selectedLayer, []),
              SketchModel.symbolInstance({
                symbolID: item.id,
                name: item.name,
              }),
            ]);
          }}
          onHoverItem={(item) => {}}
        >
          <InputField.Button>
            Insert
            <Spacer.Horizontal size={8} inline />
            <span style={{ opacity: 0.5 }}>+</span>
          </InputField.Button>
        </InputFieldWithCompletions> */}
        <TreeView.Root
          keyExtractor={({ instance: layer }) => layer.do_objectID}
          data={flattened}
          expandable={false}
          variant="bare"
          indentation={inspectorMode === 'advanced' ? 24 : 0}
          sortable={inspectorMode === 'advanced'}
          pressEventName="onPointerDown"
          acceptsDrop={(
            sourceId: string,
            destinationId: string,
            relationDropPosition: RelativeDropPosition,
          ) => {
            const sourcePaths = Hierarchy.findAllIndexPaths(
              selectedLayer,
              (layer) => sourceId === layer.do_objectID,
            );
            const destinationPath = Hierarchy.findIndexPath(
              selectedLayer,
              (layer) => layer.do_objectID === destinationId,
            );

            if (sourcePaths.length === 0 || !destinationPath) return false;

            // Don't allow dragging into root
            if (destinationPath.length === 0) return false;

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
              />
            );
          }}
        />
      </InspectorSection>
    </Stack.V>
  );
}
