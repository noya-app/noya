import cloneDeep from 'lodash/cloneDeep';
import { useNoyaClient } from 'noya-api';
import {
  Chip,
  CompletionItem,
  InputField,
  InputFieldWithCompletions,
  RelativeDropPosition,
  Stack,
  Text,
  TreeView,
  createSectionedMenu,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { CaretDownIcon } from 'noya-icons';
import { isDeepEqual, uuid } from 'noya-utils';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { DraggableMenuButton } from '../ayon/components/inspector/DraggableMenuButton';
import { HashtagIcon } from '../ayon/components/inspector/HashtagIcon';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
import { allClassNames } from '../ayon/tailwind/tailwind';
import { Model } from './builders';
import {
  PRIMITIVE_ELEMENT_NAMES,
  primitiveElements,
} from './primitiveElements';
import { ResolvedHierarchy } from './resolvedHierarchy';
import { FindComponent, createResolvedNode, handleMoveItem } from './traversal';
import { NoyaResolvedNode } from './types';

type LayoutTreeItem = {
  depth: number;
  indexPath: number[];
  key: string;
  node: NoyaResolvedNode;
  path: string[];
};

function flattenResolvedNode(resolvedNode: NoyaResolvedNode): LayoutTreeItem[] {
  return ResolvedHierarchy.flatMap(
    resolvedNode,
    (node, indexPath): LayoutTreeItem[] => {
      const depth = indexPath.length;

      if (node.type === 'noyaString') return [];

      const key = node.path.join('/');

      return [
        {
          node,
          depth,
          indexPath: indexPath.slice(),
          key,
          path: node.path,
        },
      ];
    },
  );
}

interface Props {
  onChange: (resolvedNode: NoyaResolvedNode) => void;
  findComponent: FindComponent;
  resolvedNode: NoyaResolvedNode;
  highlightedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
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
}: Props) {
  const flattened = useMemo(
    () => flattenResolvedNode(resolvedNode),
    [resolvedNode],
  );

  const [editingId, setEditingId] = useState<string | undefined>();

  return (
    <TreeView.Root
      keyExtractor={(obj) => obj.key}
      data={flattened}
      expandable={false}
      variant="bare"
      colorScheme="secondary"
      indentation={24}
      sortable
      pressEventName="onPointerDown"
      acceptsDrop={(
        sourceId: string,
        destinationId: string,
        relationDropPosition: RelativeDropPosition,
      ) => {
        const sourceItem = flattened.find((item) => sourceId === item.key);
        const destinationItem = flattened.find(
          (item) => destinationId === item.key,
        );

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
        { depth, key, indexPath, node, path },
        index,
        { isDragging },
      ) => (
        <DSLayoutRow
          id={key}
          key={key}
          onChange={onChange}
          resolvedNode={resolvedNode}
          findComponent={findComponent}
          highlightedPath={highlightedPath}
          setHighlightedPath={setHighlightedPath}
          depth={depth}
          indexPath={indexPath}
          node={node}
          path={path}
          isDragging={isDragging}
          isEditing={editingId === key}
          setEditingId={setEditingId}
        />
      )}
    />
  );
});

function getName(node: NoyaResolvedNode, findComponent: FindComponent): string {
  switch (node.type) {
    case 'noyaString':
      return node.value;
    case 'noyaPrimitiveElement':
      return node.name ?? PRIMITIVE_ELEMENT_NAMES[node.componentID];
    case 'noyaCompositeElement': {
      const component = findComponent(node.componentID);

      if (!component) return '<Component Not Found>';

      return node.name ?? component.name ?? '<No Name>';
    }
  }
}

const styleItems = allClassNames.map(
  (item): CompletionItem => ({
    name: item,
    id: item,
    icon: <HashtagIcon item={item} />,
  }),
);

const typeItems = primitiveElements.flatMap((p): CompletionItem[] => [
  {
    id: p.id,
    name: p.name,
    icon: p.icon,
  },
  // ...(p.aliases ?? []).map((alias) => ({
  //   id: p.id,
  //   name: alias,
  //   icon: p.icon,
  // })),
]);

export const DSLayoutRow = memo(function DSLayerRow({
  id,
  onChange,
  resolvedNode,
  findComponent,
  highlightedPath,
  setHighlightedPath,
  depth,
  indexPath,
  node,
  path,
  isDragging,
  isEditing,
  setEditingId,
}: {
  id: string;
  onChange: (resolvedNode: NoyaResolvedNode) => void;
  resolvedNode: NoyaResolvedNode;
  findComponent: FindComponent;
  highlightedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
  depth: number;
  key: string;
  indexPath: number[];
  node: NoyaResolvedNode;
  path: string[];
  isDragging: boolean;
  isEditing: boolean;
  setEditingId: (id: string | undefined) => void;
}) {
  const client = useNoyaClient();
  const theme = useDesignSystemTheme();
  const parent = ResolvedHierarchy.access(resolvedNode, indexPath.slice(0, -1));
  const name = getName(node, findComponent);

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
  );
  type MenuItemType = Exclude<
    Extract<(typeof menu)[number], object>['value'],
    undefined
  >;
  const hovered = highlightedPath?.join('/') === path.join('/');

  const onSelectMenuItem = (value: MenuItemType) => {
    switch (value) {
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

  return (
    <TreeView.Row
      id={id}
      depth={depth - 1}
      menuItems={menu}
      onSelectMenuItem={onSelectMenuItem}
      hovered={
        (hovered || isMenuOpen) &&
        !isDragging &&
        !isSearchingStyles &&
        !isSearchingTypes
      }
      sortable
      onMenuOpenChange={setIsMenuOpen}
      onHoverChange={(hovered) => {
        setHighlightedPath(hovered ? path : undefined);
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
        margin="2px 0"
        gap="2px"
        border={
          node.type === 'noyaCompositeElement'
            ? undefined
            : `1px solid ${theme.colors.divider}`
        }
        background={
          node.type === 'noyaCompositeElement'
            ? 'rgb(238, 229, 255)'
            : undefined
        }
        color={
          node.type === 'noyaString'
            ? 'dodgerblue'
            : node.type === 'noyaCompositeElement'
            ? theme.colors.primary
            : 'inherit'
        }
      >
        {isSearchingTypes ? (
          <InputFieldWithCompletions
            ref={typeSearchInputRef}
            placeholder={'Find component'}
            items={typeItems}
            onBlur={() => {
              setIsSearchingTypes(false);
            }}
            onSelectItem={(item) => {
              setIsSearchingTypes(false);

              if (node.type !== 'noyaPrimitiveElement') return;

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
            items={styleItems}
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
            {node.type === 'noyaPrimitiveElement' ? (
              <Chip
                size="small"
                variant={hovered ? 'outlined' : 'ghost'}
                monospace
                onClick={() => {
                  setIsSearchingTypes(true);
                }}
              >
                {PRIMITIVE_ELEMENT_NAMES[node.componentID]}
              </Chip>
            ) : node.type === 'noyaCompositeElement' && node.variantID ? (
              <Text variant="code" fontSize="9px">
                {findComponent(node.componentID)?.variants?.find(
                  (variant) => variant.id === node.variantID,
                )?.name ?? 'Default'}
              </Text>
            ) : null}
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
                  colorScheme={status === 'added' ? 'secondary' : undefined}
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
            const name = prop.name === 'src' ? 'source' : prop.name;

            return (
              <InputField.Root labelPosition="end" labelSize={60} size="small">
                <InputField.Input
                  value={prop.type === 'generator' ? prop.query : prop.value}
                  allowSubmittingWithSameValue
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

                            return p;
                          }),
                        },
                      }),
                    );
                  }}
                />
                <InputField.Label>
                  {name}
                  {prop.type === 'generator' ? ` (random)\u00A0` : ''}
                </InputField.Label>
                {prop.type === 'generator' && (
                  <InputField.DropdownMenu
                    items={[{ value: 'shuffle', title: 'Shuffle Image' }]}
                    onSelect={(value) => {
                      switch (value) {
                        case 'shuffle': {
                          client.random.resetImage({
                            id: prop.id,
                            query: prop.query,
                          });
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
                      {hovered && (
                        <>
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              height: '100%',
                              width: '100%',
                              backgroundColor: 'rgba(0, 0, 0, 0.25)',
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
