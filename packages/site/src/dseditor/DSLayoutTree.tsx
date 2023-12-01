import cloneDeep from 'lodash/cloneDeep';
import { useNoyaClientOrFallback } from 'noya-api';
import {
  FindComponent,
  Model,
  NoyaComponent,
  NoyaPrimitiveElement,
  NoyaResolvedNode,
  NoyaResolvedPrimitiveElement,
  ResolvedHierarchy,
  createResolvedNode,
  randomSeed,
  svgToReactElement,
  unresolve,
} from 'noya-component';
import {
  Chip,
  CompletionItem,
  CompletionSectionHeader,
  IconButton,
  InputField,
  InputFieldWithCompletions,
  RelativeDropPosition,
  Stack,
  TreeView,
  createSectionedMenu,
  useDesignSystemTheme,
  useOpenInputDialog,
} from 'noya-designsystem';
import {
  BoxModelIcon,
  CaretDownIcon,
  GlobeIcon,
  ImageIcon,
  ShuffleIcon,
  VercelLogoIcon,
} from 'noya-icons';
import { useKeyboardShortcuts } from 'noya-keymap';
import { isDeepEqual, uuid } from 'noya-utils';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { DraggableMenuButton } from '../ayon/components/inspector/DraggableMenuButton';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
import {
  primitiveElementStyleItems,
  styleItems,
  typeItems,
} from './completionItems';
import {
  exportLayout,
  parseLayout,
  parseLayoutWithOptions,
} from './componentLayout';
import { getComponentName, getNodeName } from './utils/nodeUtils';

type LayoutTreeItem = {
  depth: number;
  indexPath: number[];
  key: string;
  node: NoyaResolvedNode;
  path: string[];
  expanded?: boolean;
};

function flattenResolvedNode(
  resolvedNode: NoyaResolvedNode,
  expanded: Record<string, boolean>,
): LayoutTreeItem[] {
  let result: LayoutTreeItem[] = [];

  ResolvedHierarchy.visit(resolvedNode, (node, indexPath) => {
    const depth = indexPath.length;

    if (node.type === 'noyaString') return;

    const key = node.path.join('/');

    const item = {
      node,
      depth,
      indexPath: indexPath.slice(),
      key,
      path: node.path,
      expanded: expanded[key] ?? node.type !== 'noyaCompositeElement',
    };

    result.push(item);

    if (item.expanded === false) {
      return 'skip';
    }
  });

  return result;
}

interface Props {
  onChange: (resolvedNode: NoyaResolvedNode) => void;
  findComponent: FindComponent;
  resolvedNode: NoyaResolvedNode;
  highlightedPath?: string[];
  selectedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
  setSelectedPath: (path: string[] | undefined) => void;
  onCreateComponent?: (component: NoyaComponent) => void;
  components?: NoyaComponent[];
}

/**
 * The resolved node already has the diff applied, so we don't need to pass the diff separately.
 */
export const DSLayoutTree = memo(function DSLayoutTree({
  onChange,
  findComponent,
  resolvedNode,
  highlightedPath,
  setHighlightedPath,
  selectedPath,
  setSelectedPath,
  onCreateComponent,
  components,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const handleSetExpanded = useCallback((id: string, expanded: boolean) => {
    setExpanded((prev) => ({ ...prev, [id]: expanded }));
  }, []);

  const flattened = useMemo(
    () => flattenResolvedNode(resolvedNode, expanded),
    [expanded, resolvedNode],
  );

  const [editingId, setEditingId] = useState<string | undefined>();

  useKeyboardShortcuts({
    // Add a box into either the selected element or the first primitive element
    '+': () => {
      const selectedElement =
        ResolvedHierarchy.find<NoyaResolvedPrimitiveElement>(
          resolvedNode,
          (n): n is NoyaResolvedPrimitiveElement =>
            n.type === 'noyaPrimitiveElement' &&
            selectedPath?.join('/') === n.path.join('/'),
        );

      const primitiveElement =
        ResolvedHierarchy.find<NoyaResolvedPrimitiveElement>(
          resolvedNode,
          (n): n is NoyaResolvedPrimitiveElement =>
            n.type === 'noyaPrimitiveElement',
        );

      const target = selectedElement ?? primitiveElement;

      if (!target) return;

      const child = createResolvedNode(
        findComponent,
        Model.primitiveElement(boxSymbolId),
      );

      const indexPath = ResolvedHierarchy.findIndexPath(
        resolvedNode,
        (n) => n === target,
      );

      if (!indexPath) return;

      onChange(
        ResolvedHierarchy.insert(resolvedNode, {
          at: [...indexPath, target.children.length],
          nodes: [child],
        }),
      );
    },
  });

  return (
    <TreeView.Root
      keyExtractor={(obj) => obj.key}
      data={flattened}
      expandable={false}
      variant="bare"
      indentation={24}
      gap={4}
      sortable
      pressEventName="onPointerDown"
      onPress={() => {
        setSelectedPath(undefined);
      }}
      acceptsDrop={(sourceIndex, destinationIndex, relationDropPosition) => {
        const sourceItem = flattened[sourceIndex];
        const destinationItem = flattened[destinationIndex];

        if (!sourceItem || !destinationItem) return false;

        if (destinationItem.node.type !== 'noyaPrimitiveElement') return false;

        const sourcePath = ResolvedHierarchy.findIndexPath(
          resolvedNode,
          (node) => node.path.join('/') === sourceItem.path.join('/'),
        );
        const destinationPath = ResolvedHierarchy.findIndexPath(
          resolvedNode,
          (node) => node.path.join('/') === destinationItem.path.join('/'),
        );

        if (!sourcePath || !destinationPath) return false;

        // Don't allow dragging the root
        if (sourcePath.length === 0) {
          return false;
        }

        // Don't allow dragging above or below the root
        if (destinationPath.length === 0 && relationDropPosition !== 'inside') {
          return false;
        }

        const sourceParent = ResolvedHierarchy.access(
          resolvedNode,
          sourcePath.slice(0, -1),
        );

        // Don't allow dragging into a non-primitive element
        if (sourceParent.type !== 'noyaPrimitiveElement') return false;

        // Don't allow dragging into a descendant
        if (
          isDeepEqual(sourcePath, destinationPath.slice(0, sourcePath.length))
        ) {
          return false;
        }

        return true;
      }}
      onMoveItem={(
        sourceIndex: number,
        destinationIndex: number,
        position: RelativeDropPosition,
      ) => {
        const sourceItem = flattened[sourceIndex];
        const destinationItem = flattened[destinationIndex];

        const updated = handleMoveItem(
          resolvedNode,
          position,
          sourceItem.indexPath,
          destinationItem.indexPath,
        );

        onChange(updated);
      }}
      renderItem={(
        { depth, key, indexPath, node, path, expanded },
        index,
        { isDragging },
      ) => (
        <DSLayoutRow
          id={key}
          key={key}
          expanded={expanded}
          onChange={onChange}
          resolvedNode={resolvedNode}
          findComponent={findComponent}
          highlightedPath={highlightedPath}
          setHighlightedPath={setHighlightedPath}
          selectedPath={selectedPath}
          setSelectedPath={setSelectedPath}
          depth={depth}
          indexPath={indexPath}
          node={node}
          path={path}
          isDragging={isDragging}
          isEditing={editingId === key}
          setEditingId={setEditingId}
          onCreateComponent={onCreateComponent}
          components={components}
          onSetExpanded={handleSetExpanded}
        />
      )}
    />
  );
});

export const DSLayoutRow = memo(function DSLayerRow({
  id,
  onChange,
  resolvedNode,
  findComponent,
  highlightedPath,
  setHighlightedPath,
  selectedPath,
  setSelectedPath,
  depth,
  indexPath,
  node,
  path,
  isDragging,
  isEditing,
  setEditingId,
  onCreateComponent,
  components,
  expanded,
  onSetExpanded,
}: Pick<
  Props,
  'highlightedPath' | 'setHighlightedPath' | 'selectedPath' | 'setSelectedPath'
> & {
  id: string;
  onChange: (resolvedNode: NoyaResolvedNode) => void;
  resolvedNode: NoyaResolvedNode;
  findComponent: FindComponent;
  depth: number;
  key: string;
  indexPath: number[];
  node: NoyaResolvedNode;
  path: string[];
  isDragging: boolean;
  isEditing: boolean;
  setEditingId: (id: string | undefined) => void;
  expanded?: boolean;
  onSetExpanded: (id: string, expanded: boolean) => void;
} & Pick<Props, 'onCreateComponent' | 'components'>) {
  const client = useNoyaClientOrFallback();
  const theme = useDesignSystemTheme();
  const parent = ResolvedHierarchy.access(resolvedNode, indexPath.slice(0, -1));
  const name = getNodeName(node, findComponent);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const styleSearchInputRef = React.useRef<HTMLInputElement>(null);
  const [isSearchingStyles, setIsSearchingStyles] = React.useState(false);

  useEffect(() => {
    if (isSearchingStyles) {
      styleSearchInputRef.current?.focus();
    }
  }, [isSearchingStyles]);

  const typeSearchInputRef = React.useRef<HTMLInputElement>(null);
  const [isSearchingTypes, setIsSearchingTypes] = React.useState(false);

  useEffect(() => {
    if (isSearchingTypes) {
      typeSearchInputRef.current?.focus();
    }
  }, [isSearchingTypes]);

  const variantInputRef = React.useRef<HTMLInputElement>(null);
  const [isSearchingVariants, setIsSearchingVariants] = React.useState(false);

  useEffect(() => {
    if (isSearchingVariants) {
      variantInputRef.current?.focus();
    }
  }, [isSearchingVariants]);

  const menu = createSectionedMenu(
    [
      node.type === 'noyaPrimitiveElement' && {
        title: 'Add Child',
        value: 'addChild',
      },
      depth !== 0 &&
        parent.type === 'noyaPrimitiveElement' && {
          title: 'Duplicate',
          value: 'duplicate',
        },
      depth !== 0 &&
        parent.type === 'noyaPrimitiveElement' && {
          title: 'Delete',
          value: 'delete',
        },
    ],
    [
      {
        title: 'Rename',
        value: 'rename',
      },
      node.type === 'noyaPrimitiveElement' && {
        title: 'Add Style',
        value: 'addStyle',
      },
      node.type === 'noyaPrimitiveElement' && {
        title: 'Pick Component',
        value: 'addType',
      },
    ],
    [
      node.type === 'noyaCompositeElement' && {
        title: 'Replace with Contents',
        value: 'replaceWithContents',
      },
      {
        title: 'Extract to New Component',
        value: 'extractToComponent',
      },
    ],
    [
      { title: 'Copy HTML to Clipboard', value: 'copyHtml' },
      {
        title: 'Replace with HTML...',
        value: 'replaceWithHtml',
      },
      {
        title: 'Replace with raw HTML...',
        value: 'replaceWithRawHtml',
      },
    ],
  );
  type MenuItemType = Exclude<
    Extract<(typeof menu)[number], object>['value'],
    undefined
  >;
  const hovered = highlightedPath?.join('/') === path.join('/');
  const selected = selectedPath?.join('/') === path.join('/');
  const openInputDialog = useOpenInputDialog();
  const onSelectMenuItem = async (value: MenuItemType) => {
    switch (value) {
      case 'extractToComponent': {
        const name = getNodeName(node, findComponent);

        const text = await openInputDialog('Component Name', name);

        if (!text) return;

        const newComponent = Model.component({
          name: text,
          componentID: uuid(),
          rootElement: unresolve(node),
        });

        onCreateComponent?.(newComponent);

        const instance = Model.compositeElement({
          componentID: newComponent.componentID,
        });

        const findComponentPlusNewComponent: FindComponent = (componentID) =>
          componentID === newComponent.componentID
            ? newComponent
            : findComponent(componentID);

        onChange(
          ResolvedHierarchy.replace(resolvedNode, {
            at: indexPath,
            node: createResolvedNode(findComponentPlusNewComponent, instance),
          }),
        );

        break;
      }
      case 'replaceWithContents': {
        if (node.type !== 'noyaCompositeElement') break;

        const child = ResolvedHierarchy.clone(
          createResolvedNode(findComponent, node.rootElement),
        );

        onChange(
          ResolvedHierarchy.replace(resolvedNode, {
            at: indexPath,
            node: child,
          }),
        );

        break;
      }
      case 'replaceWithRawHtml': {
        const text = await openInputDialog('Paste Noya HTML');
        if (!text) return;
        const layout = parseLayoutWithOptions(text, 'geometric', {
          rewrite: false,
        });
        onChange(createResolvedNode(findComponent, layout));
        break;
      }
      case 'replaceWithHtml': {
        const text = await openInputDialog('Paste raw HTML');
        if (!text) return;
        const layout = parseLayout(text, 'geometric');
        onChange(createResolvedNode(findComponent, layout));
        break;
      }
      case 'copyHtml': {
        navigator.clipboard.writeText(exportLayout(resolvedNode));
        break;
      }
      case 'rename': {
        setEditingId(id);
        break;
      }
      case 'addStyle': {
        // Wait for menu to close
        setTimeout(() => {
          setIsSearchingStyles(true);
        }, 0);
        break;
      }
      case 'addType': {
        // Wait for menu to close
        setTimeout(() => {
          setIsSearchingTypes(true);
        }, 0);
        break;
      }
      case 'duplicate': {
        onChange(
          ResolvedHierarchy.insert(resolvedNode, {
            at: [...indexPath.slice(0, -1), indexPath.at(-1)! + 1],
            nodes: [ResolvedHierarchy.clone(node)],
          }),
        );

        break;
      }
      case 'delete': {
        onChange(
          ResolvedHierarchy.remove(resolvedNode, {
            indexPaths: [indexPath],
          }),
        );
        break;
      }
      case 'addChild': {
        if (node.type !== 'noyaPrimitiveElement') break;

        const child = createResolvedNode(
          findComponent,
          Model.primitiveElement(boxSymbolId),
        );

        onChange(
          ResolvedHierarchy.insert(resolvedNode, {
            at: [...indexPath, node.children.length],
            nodes: [child],
          }),
        );
        break;
      }
    }
  };

  const componentTypeItems = useMemo(
    (): (CompletionItem | CompletionSectionHeader)[] => [
      {
        type: 'sectionHeader',
        id: 'primitives',
        name: 'Primitive Elements',
      },
      ...typeItems,
      {
        type: 'sectionHeader',
        id: 'components',
        name: 'Custom Components',
      },
      ...(components ?? []).map((c) => ({
        id: c.componentID,
        name: c.name,
      })),
    ],
    [components],
  );

  const showHoverRing =
    (hovered || isMenuOpen) &&
    !isDragging &&
    !isSearchingStyles &&
    !isSearchingTypes;

  const ref = React.useRef<HTMLLIElement>(null);

  return (
    <TreeView.Row
      ref={ref}
      id={id}
      depth={depth - 1}
      menuItems={menu}
      onSelectMenuItem={onSelectMenuItem}
      sortable
      onMenuOpenChange={setIsMenuOpen}
      onHoverChange={(hovered) => {
        setHighlightedPath(hovered ? path : undefined);
      }}
      onPress={() => {
        setSelectedPath(path);
        ref.current?.focus();
      }}
      icon={
        depth !== 0 && (
          <DraggableMenuButton
            isVisible={hovered || isMenuOpen || isDragging}
            items={menu}
            onSelect={onSelectMenuItem}
          />
        )
      }
      onDoubleClick={() => {
        setEditingId(id);
      }}
    >
      <Stack.V
        flex="1 1 0%"
        padding="1px"
        borderRadius="4px"
        gap="2px"
        border={
          showHoverRing
            ? `1px solid ${theme.colors.primary}`
            : node.type === 'noyaCompositeElement'
            ? `1px solid transparent`
            : `1px solid ${theme.colors.divider}`
        }
        background={
          selected
            ? theme.colors.primary
            : node.type === 'noyaCompositeElement'
            ? 'rgb(238, 229, 255)'
            : undefined
        }
        color={
          selected
            ? 'white'
            : node.type === 'noyaCompositeElement'
            ? theme.colors.primary
            : 'inherit'
        }
      >
        {isSearchingTypes ? (
          <InputFieldWithCompletions
            ref={typeSearchInputRef}
            placeholder={'Find component'}
            items={componentTypeItems}
            onBlur={() => {
              setIsSearchingTypes(false);
            }}
            onSelectItem={(item) => {
              setIsSearchingTypes(false);

              const component = findComponent(item.id);
              const parentPath = node.path.slice(0, 1);

              if (component) {
                onChange(
                  ResolvedHierarchy.replace(resolvedNode, {
                    at: indexPath,
                    node: createResolvedNode(
                      findComponent,
                      Model.compositeElement({
                        componentID: item.id,
                        name: node.name ?? item.name,
                      }),
                      parentPath,
                    ),
                  }),
                );
              } else {
                if (node.type === 'noyaPrimitiveElement') {
                  onChange(
                    ResolvedHierarchy.replace(resolvedNode, {
                      at: indexPath,
                      node: {
                        ...cloneDeep(node),
                        componentID: item.id,
                        id: uuid(), // New id to flag as add/remove change
                      },
                    }),
                  );
                } else {
                  onChange(
                    ResolvedHierarchy.replace(resolvedNode, {
                      at: indexPath,
                      node: createResolvedNode(
                        findComponent,
                        Model.primitiveElement({
                          componentID: item.id,
                          name: node.name ?? item.name,
                        }),
                        parentPath,
                      ),
                    }),
                  );
                }
              }
            }}
            style={{
              zIndex: 1, // Focus outline should appear above chips
              background: 'transparent',
            }}
          />
        ) : isSearchingVariants && node.type === 'noyaCompositeElement' ? (
          <InputFieldWithCompletions
            ref={variantInputRef}
            placeholder={'Find variant'}
            items={
              findComponent(node.componentID)?.variants?.map(
                (variant): CompletionItem => ({
                  id: variant.id,
                  name: variant.name || '',
                }),
              ) ?? []
            }
            onBlur={() => {
              setIsSearchingVariants(false);
            }}
            onSelectItem={(item) => {
              setIsSearchingVariants(false);

              onChange(
                ResolvedHierarchy.replace(resolvedNode, {
                  at: indexPath,
                  node: {
                    ...cloneDeep(node),
                    variantNames: [
                      ...(node.variantNames ?? []),
                      Model.variantName(item.id),
                    ],
                  },
                }),
              );
            }}
            style={{
              zIndex: 1, // Focus outline should appear above chips
              background: 'transparent',
            }}
          />
        ) : isSearchingStyles ? (
          <InputFieldWithCompletions
            ref={styleSearchInputRef}
            placeholder={'Find style'}
            items={
              primitiveElementStyleItems[
                (node as NoyaPrimitiveElement).componentID
              ] ?? styleItems
            }
            onBlur={() => {
              setIsSearchingStyles(false);
            }}
            onSelectItem={(item) => {
              setIsSearchingStyles(false);

              if (node.type !== 'noyaPrimitiveElement') return;

              onChange(
                ResolvedHierarchy.replace(resolvedNode, {
                  at: indexPath,
                  node: {
                    ...cloneDeep(node),
                    classNames: [
                      ...node.classNames,
                      Model.className(item.name),
                    ],
                  },
                }),
              );
            }}
            style={{
              zIndex: 1, // Focus outline should appear above chips
              background: 'transparent',
            }}
          />
        ) : node.type === 'noyaString' ? (
          <InputField.Root>
            <InputField.Input
              style={{
                background: 'transparent',
                color: 'dodgerblue',
              }}
              value={node.value}
              onChange={(value) => {}}
            />
          </InputField.Root>
        ) : (
          <Stack.H
            padding="4px 6px"
            alignItems="center"
            zIndex={isEditing ? 1 : undefined}
            gap="4px"
          >
            {node.type === 'noyaCompositeElement' && (
              <IconButton
                iconName={expanded ? 'CaretDownIcon' : 'CaretRightIcon'}
                color={theme.colors.primary}
                onClick={() => {
                  onSetExpanded(id, !expanded);
                }}
                contentStyle={{
                  marginLeft: '-2px',
                }}
              />
            )}
            {isEditing ? (
              <TreeView.EditableRowTitle
                value={name}
                onSubmitEditing={(value) => {
                  setEditingId(undefined);

                  onChange(
                    ResolvedHierarchy.replace(resolvedNode, {
                      at: indexPath,
                      node: { ...cloneDeep(node), name: value },
                    }),
                  );
                }}
                autoFocus
              />
            ) : (
              <TreeView.RowTitle style={{ width: 0 }}>{name}</TreeView.RowTitle>
            )}
            <Chip
              size="small"
              variant={hovered ? 'outlined' : 'ghost'}
              colorScheme={selected ? 'primary' : undefined}
              monospace
              style={{
                ...(selected && {
                  color: 'white',
                }),
              }}
              onClick={() => {
                setIsSearchingTypes(true);
              }}
            >
              {getComponentName(node, findComponent)}
            </Chip>
          </Stack.H>
        )}
        {node.type === 'noyaCompositeElement' &&
          (findComponent(node.componentID)?.variants?.length ?? 0) > 0 && (
            <Stack.H flexWrap="wrap" gap="2px" margin={'-2px 0 0 0'}>
              {node.variantNames?.map(({ variantID, id }) => {
                return (
                  <Chip
                    key={id}
                    size={'small'}
                    monospace
                    deletable
                    style={{
                      color: theme.colors.primary,
                      background: 'rgb(226, 211, 255)',
                    }}
                    onDelete={() => {
                      onChange(
                        ResolvedHierarchy.replace(resolvedNode, {
                          at: indexPath,
                          node: {
                            ...node,
                            variantNames: node.variantNames?.filter(
                              (variantName) => variantName.id !== id,
                            ),
                          },
                        }),
                      );
                    }}
                  >
                    {findComponent(node.componentID)?.variants?.find(
                      (variant) => variant.id === variantID,
                    )?.name ?? 'Default'}
                  </Chip>
                );
              })}
              <Chip
                size={'small'}
                addable
                monospace
                style={{
                  color: theme.colors.primary,
                  background: 'rgb(226, 211, 255)',
                }}
                onAdd={() => {
                  if (isSearchingVariants) {
                    setIsSearchingVariants(false);
                  } else {
                    setIsSearchingVariants(true);
                  }
                }}
              />
            </Stack.H>
          )}
        {node.type === 'noyaPrimitiveElement' && (
          <Stack.H flexWrap="wrap" gap="2px" margin={'-2px 0 0 0'}>
            {node.classNames.map(({ value, id }) => {
              const status = undefined;

              return (
                <Chip
                  key={id}
                  size={'small'}
                  deletable={status !== 'removed'}
                  addable={status === 'removed'}
                  monospace
                  colorScheme={
                    selected
                      ? 'primary'
                      : status === 'added'
                      ? 'secondary'
                      : undefined
                  }
                  style={{
                    opacity: status === 'removed' ? 0.5 : 1,
                  }}
                  onDelete={() => {
                    onChange(
                      ResolvedHierarchy.replace(resolvedNode, {
                        at: indexPath,
                        node: {
                          ...node,
                          classNames: node.classNames.filter(
                            (className) => className.value !== value,
                          ),
                        },
                      }),
                    );
                  }}
                  // onAdd={() => {
                  //   if (rootNode.type !== 'noyaCompositeElement') return;

                  //   const newSelection: NoyaCompositeElement = {
                  //     ...rootNode,
                  //     diff: resetRemovedClassName(
                  //       rootNode.diff,
                  //       path.slice(1),
                  //       value,
                  //     ),
                  //   };

                  //   setDiff(newSelection);
                  // }}
                >
                  {value}
                </Chip>
              );
            })}
            <Chip
              size={'small'}
              addable
              monospace
              colorScheme={selected ? 'primary' : undefined}
              onAdd={() => {
                if (isSearchingStyles) {
                  setIsSearchingStyles(false);
                } else {
                  setIsSearchingStyles(true);
                }
              }}
            />
          </Stack.H>
        )}
        {node.type === 'noyaPrimitiveElement' &&
          node.props.length > 0 &&
          node.props.map((prop) => {
            return (
              <InputField.Root
                key={prop.id}
                labelPosition="end"
                labelSize={60}
                size="small"
              >
                <InputField.Input
                  value={
                    prop.type === 'generator'
                      ? prop.generator === 'geometric'
                        ? ''
                        : prop.query
                      : prop.value.toString()
                  }
                  allowSubmittingWithSameValue
                  disabled={
                    prop.type === 'generator' && prop.generator === 'geometric'
                  }
                  submitAutomaticallyAfterDelay={
                    prop.type === 'generator' ? 300 : 100
                  }
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onSubmit={(value) => {
                    onChange(
                      ResolvedHierarchy.replace(resolvedNode, {
                        at: indexPath,
                        node: {
                          ...node,
                          props: node.props.map((p) => {
                            if (
                              p.name === prop.name &&
                              p.type === 'generator' &&
                              prop.type === 'generator' &&
                              p.generator === prop.generator
                            ) {
                              return { ...p, query: value };
                            }

                            if (
                              p.name === prop.name &&
                              p.type === 'string' &&
                              prop.type === 'string'
                            ) {
                              return { ...p, value };
                            }

                            if (
                              p.name === prop.name &&
                              p.type === 'number' &&
                              prop.type === 'number'
                            ) {
                              const parsed = parseFloat(value);

                              return {
                                ...p,
                                value: Number.isFinite(parsed)
                                  ? parsed
                                  : p.value,
                              };
                            }

                            return p;
                          }),
                        },
                      }),
                    );
                  }}
                />
                <InputField.Label>
                  {prop.type === 'generator'
                    ? `${
                        prop.generator === 'geometric'
                          ? 'Geometric Pattern'
                          : prop.generator === 'random-icon'
                          ? 'Iconify'
                          : 'Unsplash Stock Photo'
                      }\u00A0\u00A0`
                    : prop.name}
                </InputField.Label>
                {prop.type === 'generator' && (
                  <InputField.DropdownMenu
                    items={createSectionedMenu(
                      [
                        (prop.generator === 'random-image' ||
                          prop.generator === 'geometric') && {
                          value: 'shuffle',
                          title: 'Shuffle',
                          icon: <ShuffleIcon />,
                        },
                      ],
                      [
                        prop.generator !== 'random-icon' && {
                          value: 'random-icon',
                          title: 'Switch to Icon',
                          icon: <VercelLogoIcon />,
                        },
                        prop.generator !== 'random-image' && {
                          value: 'random-image',
                          title: 'Switch to Stock Photo',
                          icon: <ImageIcon />,
                        },
                        prop.generator !== 'geometric' && {
                          value: 'geometric',
                          title: 'Switch to Geometric Pattern',
                          icon: <BoxModelIcon />,
                        },
                      ],
                      [
                        prop.generator !== 'geometric' && {
                          value: 'fetch',
                          title: 'Fetch',
                          icon: <GlobeIcon />,
                        },
                      ],
                    )}
                    onSelect={async (value) => {
                      switch (value) {
                        case 'fetch': {
                          switch (prop.generator) {
                            case 'random-image':
                              break;
                            case 'random-icon':
                              const data =
                                await client.networkClient.random.icon({
                                  query: prop.query,
                                  preferredCollection: 'heroicons',
                                });

                              if (data.icons.length === 0) return;

                              const icon = data.icons[0];

                              const iconResponse = await fetch(icon);
                              const svg = await iconResponse.text();

                              onChange(
                                ResolvedHierarchy.replace(resolvedNode, {
                                  at: indexPath,
                                  node: {
                                    ...node,
                                    props: node.props.map((p) =>
                                      p.name === prop.name &&
                                      p.type === 'generator' &&
                                      p.generator === prop.generator
                                        ? {
                                            ...p,
                                            result: svg,
                                            resolvedQuery: prop.query,
                                          }
                                        : p,
                                    ),
                                  },
                                }),
                              );
                              break;
                          }

                          break;
                        }
                        case 'geometric':
                        case 'random-image':
                        case 'random-icon': {
                          onChange(
                            ResolvedHierarchy.replace(resolvedNode, {
                              at: indexPath,
                              node: {
                                ...node,
                                props: node.props.map((p) =>
                                  p.name === prop.name &&
                                  p.type === 'generator' &&
                                  p.generator === prop.generator
                                    ? {
                                        ...p,
                                        generator: value,
                                        query: '',
                                        result: undefined,
                                        resolvedQuery: undefined,
                                      }
                                    : p,
                                ),
                              },
                            }),
                          );
                          break;
                        }
                        case 'shuffle': {
                          switch (prop.generator) {
                            case 'random-image':
                              client.random.resetImage({
                                id: prop.id,
                                query: prop.query,
                              });
                              break;
                            case 'random-icon':
                              client.random.resetIcon({
                                id: prop.id,
                                query: prop.query,
                              });
                              break;
                          }

                          onChange(
                            ResolvedHierarchy.replace(resolvedNode, {
                              at: indexPath,
                              node: {
                                ...node,
                                props: node.props.map((p) =>
                                  p.name === prop.name &&
                                  p.type === 'generator' &&
                                  p.generator === prop.generator
                                    ? {
                                        ...p,
                                        query:
                                          prop.generator === 'geometric'
                                            ? randomSeed()
                                            : p.query,
                                        result: undefined,
                                        resolvedQuery: undefined,
                                      }
                                    : p,
                                ),
                              },
                            }),
                          );
                          break;
                        }
                      }
                    }}
                  >
                    <div
                      style={{
                        position: 'relative',
                        top: '1px',
                        right: '1px',
                        height: '15px',
                        width: '15px',
                        // aspectRatio: '1/1',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        borderRadius: '4px',
                        marginLeft: '4px',
                        // marginRight: '-6px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                      }}
                    >
                      {prop.generator === 'geometric' ? (
                        <BoxModelIcon color="#aaa" />
                      ) : prop.result?.startsWith('<svg') ? (
                        svgToReactElement(prop.result)
                      ) : (
                        <img
                          src={prop.result}
                          alt=""
                          style={{
                            position: 'absolute',
                            inset: 0,
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            borderRadius: '4px',
                          }}
                        />
                      )}
                      {hovered && (
                        <>
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              height: '100%',
                              width: '100%',
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            }}
                          />
                          <CaretDownIcon
                            color="white"
                            style={{
                              position: 'relative',
                            }}
                          />
                        </>
                      )}
                    </div>
                  </InputField.DropdownMenu>
                )}
              </InputField.Root>
            );
          })}
      </Stack.V>
    </TreeView.Row>
  );
});

function handleMoveItem(
  root: NoyaResolvedNode,
  position: RelativeDropPosition,
  sourceIndexPath: number[],
  destinationIndexPath: number[],
) {
  function inner() {
    switch (position) {
      case 'above': {
        return ResolvedHierarchy.move(root, {
          indexPaths: [sourceIndexPath],
          to: destinationIndexPath,
        });
      }
      case 'below': {
        return ResolvedHierarchy.move(root, {
          indexPaths: [sourceIndexPath],
          to: [
            ...destinationIndexPath.slice(0, -1),
            destinationIndexPath.at(-1)! + 1,
          ],
        });
      }
      case 'inside': {
        return ResolvedHierarchy.move(root, {
          indexPaths: [sourceIndexPath],
          to: [...destinationIndexPath, 0],
        });
      }
    }
  }

  return inner();
}
