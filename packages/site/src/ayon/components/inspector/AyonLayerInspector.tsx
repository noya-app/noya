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
  useDesignSystemTheme,
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
  Selectors,
  createOverrideHierarchy,
  getSiblingBlocks,
} from 'noya-state';
import { isDeepEqual } from 'noya-utils';
import React, { useCallback, useEffect, useMemo } from 'react';
import { BlockPreviewProps } from '../../../docs/InteractiveBlockPreview';
import { inferBlockTypes } from '../../infer/inferBlock';
import { boxSymbolId } from '../../symbols/symbolIds';
import { allInsertableSymbols } from '../../symbols/symbols';
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

  const handleHoverBlockItem = useCallback(
    (item: CompletionItem | undefined) => {
      onSetOverriddenBlock(
        item
          ? {
              symbolId: item.id,
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
    <Stack.V gap="1px" position="relative">
      <InspectorSection>
        <InputFieldWithCompletions
          ref={componentSearchInputRef}
          size="large"
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
      </InspectorSection>
      <InspectorSection title="Style" titleTextStyle="small">
        <InputFieldWithCompletions
          ref={styleSearchInputRef}
          size="large"
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
                symbolId: selectedLayer.symbolID,
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
                key={parameter}
                deletable
                monospace
                onHoverDeleteChange={(isHovering) => {
                  if (isHovering) {
                    onSetOverriddenBlock({
                      symbolId: selectedLayer.symbolID,
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
              >
                {parameter}
              </Chip>
            ))}
          </Stack.H>
        )}
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
      <InspectorSection title="Content" titleTextStyle="small">
        <InputFieldWithCompletions
          ref={nestedComponentSearchInputRef}
          size="large"
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
        <TreeView.Root
          keyExtractor={({ instance: layer }) => layer.do_objectID}
          data={flattened}
          expandable={false}
          variant="bare"
          indentation={24}
          sortable
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
              <ContentItem
                key={key}
                layer={layer}
                depth={depth}
                path={path}
                selectedLayer={selectedLayer}
                isDragging={isDragging}
                onSetOverriddenBlock={onSetOverriddenBlock}
              />
            );
          }}
        />
        <Spacer.Vertical size={200} />
      </InspectorSection>
    </Stack.V>
  );
}

function ContentItem({
  layer,
  depth,
  path,
  selectedLayer,
  isDragging,
  onSetOverriddenBlock,
}: {
  layer: Sketch.SymbolInstance;
  depth: number;
  path: string[];
  selectedLayer: Sketch.SymbolInstance;
  isDragging: boolean;
  onSetOverriddenBlock: (
    overriddenBlock: BlockPreviewProps | undefined,
  ) => void;
}) {
  const theme = useDesignSystemTheme();
  const [state, dispatch] = useApplicationState();
  const getSymbolMaster = useCallback(
    (symbolId: string) => Selectors.getSymbolMaster(state, symbolId),
    [state],
  );
  const master = getSymbolMaster(layer.symbolID);

  const componentName = master.name.toUpperCase();
  const placeholderText = master.blockDefinition?.placeholderText;
  const key = path.join('/');

  const [hovered, setHovered] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);

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
    (item) => !layer.blockParameters?.includes(item.name),
  );

  const modalSearchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearching) {
      modalSearchInputRef.current?.focus();
    }
  }, [isSearching]);

  return (
    <TreeView.Row
      key={key}
      id={layer.do_objectID}
      depth={depth - 1}
      icon={depth !== 0 && <DragHandleDots2Icon />}
      onHoverChange={setHovered}
    >
      <Stack.V
        flex="1"
        border={`1px solid ${theme.colors.divider}`}
        padding="1px"
        margin="4px 0"
        borderRadius="6px"
        gap="2px"
      >
        <Stack.H flex="1" opacity={isDragging ? 0.5 : 1}>
          {isSearching ? (
            <InputFieldWithCompletions
              ref={modalSearchInputRef}
              placeholder={'Find component/style'}
              items={unusedStyleItems}
              onBlur={() => {
                setIsSearching(false);
              }}
              onSelectItem={(item) => {
                const updatedParameters = (layer.blockParameters ?? []).concat(
                  item.name,
                );

                const overrideName = Overrides.encodeName(
                  path,
                  'blockParameters',
                );

                dispatch(
                  'setOverrideValue',
                  undefined,
                  overrideName,
                  updatedParameters,
                );
              }}
              style={{
                background: 'transparent',
              }}
            />
          ) : (
            <InputField.Root key={key} labelPosition="end" labelSize={60}>
              <InputField.Input
                style={{
                  background: 'transparent',
                }}
                value={layer.blockText ?? ''}
                placeholder={placeholderText}
                onKeyDown={(event) => {
                  switch (event.key) {
                    case '#': {
                      event.preventDefault();
                      event.stopPropagation();

                      setIsSearching(true);
                    }
                  }
                }}
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
              {hovered ? (
                <InputField.Button
                  onClick={() => {
                    setIsSearching(true);
                  }}
                >
                  Edit
                </InputField.Button>
              ) : (
                <InputField.Label>{componentName}</InputField.Label>
              )}
            </InputField.Root>
          )}
        </Stack.H>
        {layer.blockParameters && layer.blockParameters.length > 0 && (
          <Stack.H flexWrap="wrap" gap="2px">
            {layer.blockParameters.map((parameter) => (
              <Chip
                key={parameter}
                size="small"
                deletable
                monospace
                // TODO: This seems to permanently mutate block parameters in the layer tree.
                // Afterwards, if we add/remove block parameters they don't get rendered.
                // Refreshing the page fixes it.
                // onHoverDeleteChange={(isHovering) => {
                //   const updatedParameters = (
                //     layer.blockParameters ?? []
                //   ).filter((p) => p !== parameter);

                //   const overrideName = Overrides.encodeName(
                //     path,
                //     'blockParameters',
                //   );

                //   const updatedOverrideValues = selectedLayer.overrideValues
                //     .filter(
                //       (override) => override.overrideName !== overrideName,
                //     )
                //     .concat(
                //       SketchModel.overrideValue({
                //         overrideName,
                //         value: updatedParameters,
                //       }),
                //     );

                //   if (isHovering) {
                //     onSetOverriddenBlock({
                //       blockId: selectedLayer.symbolID,
                //       blockText: selectedLayer.blockText,
                //       blockParameters: selectedLayer.blockParameters,
                //       overrideValues: updatedOverrideValues,
                //       resolvedBlockText:
                //         selectedLayer.resolvedBlockData?.resolvedText,
                //     });
                //   } else {
                //     onSetOverriddenBlock(undefined);
                //   }
                // }}
                onDelete={() => {
                  const updatedParameters = (
                    layer.blockParameters ?? []
                  ).filter((p) => p !== parameter);

                  const overrideName = Overrides.encodeName(
                    path,
                    'blockParameters',
                  );

                  dispatch(
                    'setOverrideValue',
                    undefined,
                    overrideName,
                    updatedParameters,
                  );
                }}
              >
                {parameter}
              </Chip>
            ))}
          </Stack.H>
        )}
      </Stack.V>
    </TreeView.Row>
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
