import { useApplicationState } from 'noya-app-state-context';
import {
  Chip,
  CompletionItem,
  InputField,
  InputFieldWithCompletions,
  RelativeDropPosition,
  Spacer,
  Stack,
  TreeView,
  lightTheme,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { DragHandleDots2Icon } from 'noya-icons';
import { InspectorPrimitives } from 'noya-inspector';
import { useKeyboardShortcuts } from 'noya-keymap';
import { SketchModel } from 'noya-sketch-model';
import {
  Action,
  Layers,
  OverriddenBlockContent,
  Overrides,
  createOverrideHierarchy,
  getSiblingBlocks,
  getSymbolMaster,
} from 'noya-state';
import { isDeepEqual } from 'noya-utils';
import React, { useCallback, useMemo } from 'react';
import { BlockPreviewProps } from '../../../docs/InteractiveBlockPreview';
import { allInsertableSymbols, symbolMap } from '../../blocks/blocks';
import { inferBlockTypes } from '../../infer/inferBlock';
import { boxSymbolId } from '../../symbols/symbolIds';
import { parametersToTailwindStyle } from '../../tailwind/tailwind';
import { InspectorCarousel } from './InspectorCarousel';

const InspectorSection = ({
  children,
  title,
  titleTextStyle,
}: {
  children: React.ReactNode;
  title?: string;
  titleTextStyle?: 'small';
}) => (
  <Stack.V
    padding={title ? '32px 12px 12px' : '12px'}
    gap="12px"
    background="white"
  >
    {title && (
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title textStyle={titleTextStyle}>
          {title}
        </InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
    )}
    {children}
  </Stack.V>
);

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

  const componentSearchInputRef = React.useRef<HTMLInputElement>(null);
  const styleSearchInputRef = React.useRef<HTMLInputElement>(null);
  const nestedComponentSearchInputRef = React.useRef<HTMLInputElement>(null);

  const blockCompletionItems = useMemo(
    () =>
      allInsertableSymbols.map(
        (block): CompletionItem => ({
          id: block.symbolID,
          name: block.name,
        }),
      ),
    [],
  );

  const handleSelectBlockItem = useCallback(
    (item: CompletionItem) => {
      dispatch('setSymbolInstanceSource', item.id, 'preserveCurrent');
    },
    [dispatch],
  );

  const onSetOverriddenBlock = useCallback(
    (item: BlockPreviewProps | undefined) => {
      if (item) {
        setOverriddenBlock({
          layerId: selectedLayer.do_objectID,
          blockContent: {
            symbolId: item.blockId,
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

  const handleHoverBlockItem = useCallback(
    (item: CompletionItem | undefined) => {
      onSetOverriddenBlock(
        item
          ? {
              blockId: item.id,
              blockText: selectedLayer.blockText,
              overrideValues: selectedLayer.overrideValues,
              resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
            }
          : undefined,
      );
    },
    [
      onSetOverriddenBlock,
      selectedLayer.blockText,
      selectedLayer.overrideValues,
      selectedLayer.resolvedBlockData?.resolvedText,
    ],
  );

  useKeyboardShortcuts({
    '/': () => {
      componentSearchInputRef.current?.focus();
    },
    '#': () => {
      styleSearchInputRef.current?.focus();
    },
    '+': () => {
      nestedComponentSearchInputRef.current?.focus();
    },
  });

  const master = getSymbolMaster(state, selectedLayer.symbolID);
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
      blockId: selectedLayer.symbolID,
      blockText: selectedLayer.blockText,
      blockParameters: parameters,
      overrideValues: selectedLayer.overrideValues,
      resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
    },
    ...blockTypes
      .flatMap(({ type }) => (typeof type === 'string' ? [] : type.symbolId))
      .filter(
        (blockId) =>
          blockId !== boxSymbolId && blockId !== selectedLayer.symbolID,
      )
      .slice(0, 2)
      .map(
        (blockId): BlockPreviewProps => ({
          blockId,
          blockText: selectedLayer.blockText,
          blockParameters: parameters,
          overrideValues: selectedLayer.overrideValues,
          resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
        }),
      ),
  ];

  const presetStyles: BlockPreviewProps[] =
    master.blockDefinition?.stylePresets?.map((preset) => ({
      blockId: selectedLayer.symbolID,
      blockText: selectedLayer.blockText,
      blockParameters: preset.parameters,
      overrideValues: selectedLayer.overrideValues,
      resolvedBlockText: selectedLayer.resolvedBlockData?.resolvedText,
    })) ?? [];

  const styleItems = useMemo(
    () =>
      (master.blockDefinition?.hashtags ?? []).map((item) => ({
        name: item,
        id: item,
        icon: <HashtagIcon item={item} />,
      })),
    [master.blockDefinition?.hashtags],
  );

  const unusedStyleItems = styleItems.filter(
    (item) => !parameters?.includes(item.name),
  );

  type LayerTreeItem = {
    instance: Sketch.SymbolInstance;
    depth: number;
    path: string[];
    indexPath: number[];
  };

  const Hierarchy = createOverrideHierarchy(state);

  const flattened = Hierarchy.flatMap(
    selectedLayer,
    (layer, indexPath): LayerTreeItem[] => {
      if (!Layers.isSymbolInstance(layer)) return [];

      if (indexPath.length === 0 && !master.blockDefinition?.render) {
        return [];
      }

      return [
        {
          instance: layer,
          depth: indexPath.length,
          indexPath: indexPath.slice(),
          path: Hierarchy.accessPath(selectedLayer, indexPath)
            .slice(1)
            .map((layer) => layer.do_objectID),
        },
      ];
    },
  );

  // console.log({
  //   overrides: selectedLayer.overrideValues,
  // });

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
    <Stack.V gap="1px">
      <InspectorSection>
        <InputFieldWithCompletions
          ref={componentSearchInputRef}
          placeholder={componentName}
          items={blockCompletionItems}
          onSelectItem={handleSelectBlockItem}
          onHoverItem={handleHoverBlockItem}
        >
          <InputField.Button>
            Pick
            <Spacer.Horizontal size={8} inline />
            <span style={{ opacity: 0.5 }}>/</span>
          </InputField.Button>
        </InputFieldWithCompletions>
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>
            Related Components
          </InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorCarousel
          key={selectedLayer.symbolID}
          items={[]}
          // items={relatedBlocks}
          selectedIndex={0}
          onSelectItem={(index) => {
            dispatch(
              'setSymbolInstanceSource',
              relatedBlocks[index].blockId,
              'preserveCurrent',
            );
          }}
          onHoverItemChange={(index, isHovering) => {
            onSetOverriddenBlock(isHovering ? relatedBlocks[index] : undefined);
          }}
        />
      </InspectorSection>
      <InspectorSection title="Style" titleTextStyle="small">
        <InputFieldWithCompletions
          ref={styleSearchInputRef}
          placeholder={'Styles'}
          items={unusedStyleItems}
          onSelectItem={(item) => {
            dispatch('setBlockParameters', undefined, [
              ...(parameters ?? []),
              item.name,
            ]);
          }}
          onHoverItem={(item) => {
            if (item) {
              onSetOverriddenBlock({
                blockId: selectedLayer.symbolID,
                blockText: selectedLayer.blockText,
                blockParameters: (parameters ?? []).concat(item.name),
                overrideValues: selectedLayer.overrideValues,
                resolvedBlockText:
                  selectedLayer.resolvedBlockData?.resolvedText,
              });
            } else {
              onSetOverriddenBlock(undefined);
            }
          }}
        >
          <InputField.Button>
            Add
            <Spacer.Horizontal size={8} inline />
            <span style={{ opacity: 0.5 }}>#</span>
          </InputField.Button>
        </InputFieldWithCompletions>
        {parameters && parameters.length > 0 && (
          <Stack.H flexWrap="wrap" gap="8px">
            {parameters.map((parameter) => (
              <Chip
                deletable
                onHoverDeleteChange={(isHovering) => {
                  if (isHovering) {
                    onSetOverriddenBlock({
                      blockId: selectedLayer.symbolID,
                      blockText: selectedLayer.blockText,
                      blockParameters: (parameters ?? []).filter(
                        (p) => p !== parameter,
                      ),
                      overrideValues: selectedLayer.overrideValues,
                      resolvedBlockText:
                        selectedLayer.resolvedBlockData?.resolvedText,
                    });
                  } else {
                    onSetOverriddenBlock(undefined);
                  }
                }}
                onDelete={() => {
                  dispatch(
                    'setBlockParameters',
                    undefined,
                    (parameters ?? []).filter((p) => p !== parameter),
                  );
                }}
                style={{
                  fontFamily: lightTheme.fonts.monospace,
                }}
                // style={{
                //   backgroundColor: '#545454',
                //   color: 'white',
                // }}
                key={parameter}
              >
                {parameter}
              </Chip>
            ))}
          </Stack.H>
        )}
        <InspectorPrimitives.SectionHeader>
          <InspectorPrimitives.Title>Presets</InspectorPrimitives.Title>
        </InspectorPrimitives.SectionHeader>
        <InspectorCarousel
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
            onSetOverriddenBlock(isHovering ? presetStyles[index] : undefined);
          }}
        />
      </InspectorSection>
      <InspectorSection title="Content" titleTextStyle="small">
        <InputFieldWithCompletions
          ref={nestedComponentSearchInputRef}
          placeholder={'Content'}
          items={blockCompletionItems}
          onSelectItem={(item) => {
            dispatch('setOverrideValue', undefined, 'layers', [
              ...Hierarchy.getChildren(selectedLayer, []),
              SketchModel.symbolInstance({
                symbolID: item.id,
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
        </InputFieldWithCompletions>
        <Stack.V gap="4px">
          <TreeView.Root
            keyExtractor={({ instance: layer }) => layer.do_objectID}
            data={flattened}
            expandable={false}
            variant="bare"
            indentation={24}
            sortable
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
              const symbol = symbolMap[layer.symbolID];

              const componentName = symbol?.name.toUpperCase();
              const placeholderText = symbol?.blockDefinition?.placeholderText;
              const key = path.join('/');

              return (
                <TreeView.Row
                  key={key}
                  id={layer.do_objectID}
                  depth={depth - 1}
                  icon={depth !== 0 && <DragHandleDots2Icon />}
                >
                  <Stack.H
                    flex="1"
                    padding={'4px 0'}
                    opacity={isDragging ? 0.5 : 1}
                  >
                    <InputField.Root
                      key={key}
                      labelPosition="end"
                      labelSize={60}
                    >
                      <InputField.Input
                        value={layer.blockText ?? ''}
                        placeholder={placeholderText}
                        onChange={(value) => {
                          if (depth === 0) {
                            dispatch('setBlockText', undefined, value);
                          } else {
                            dispatch(
                              'setOverrideValue',
                              undefined,
                              Overrides.encodeName(path, 'blockText'),
                              value,
                            );
                          }
                        }}
                      />
                      {componentName && (
                        <InputField.Label>{componentName}</InputField.Label>
                      )}
                    </InputField.Root>
                    {/* <Button
                      variant="floating"
                      onClick={() => {
                        const updated = Hierarchy.insert(selectedLayer, {
                          at: [...indexPath, 1000],
                          nodes: [
                            SketchModel.symbolInstance({
                              symbolID: buttonSymbolId,
                            }),
                          ],
                        });

                        setAllOverrides(updated);
                      }}
                    >
                      +
                    </Button>
                    <IconButton
                      iconName="TrashIcon"
                      onClick={() => {
                        const updated = Hierarchy.remove(selectedLayer, {
                          indexPaths: [indexPath],
                        });

                        setAllOverrides(updated);
                      }}
                    /> */}
                  </Stack.H>
                </TreeView.Row>
              );
            }}
          />
        </Stack.V>
      </InspectorSection>
    </Stack.V>
  );
}

function HashtagIcon({ item }: { item: string }) {
  const resolvedStyle = parametersToTailwindStyle({
    [item]: true,
  });

  return (
    <div
      style={{
        width: 19,
        height: 19,
        borderWidth: /^border(?!-\d)/.test(item) ? 1 : undefined,
        background: /^rounded/.test(item)
          ? 'rgb(148 163 184)'
          : /^opacity/.test(item)
          ? 'black'
          : undefined,
        ...resolvedStyle,
      }}
      className={/^(p\w?-|m\w?-)/.test(item) ? undefined : item}
    >
      {/^(text|font)/.test(item) ? 'Tt' : null}
    </div>
  );
}
