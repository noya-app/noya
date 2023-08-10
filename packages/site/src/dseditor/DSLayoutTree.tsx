import {
  Button,
  Chip,
  InputField,
  InputFieldWithCompletions,
  RelativeDropPosition,
  Stack,
  Text,
  TreeView,
  createSectionedMenu,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { isDeepEqual, uuid } from 'noya-utils';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { DraggableMenuButton } from '../ayon/components/inspector/DraggableMenuButton';
import { HashtagIcon } from '../ayon/components/inspector/HashtagIcon';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
import { allClassNames } from '../ayon/tailwind/tailwind';
import { Model } from './builders';
import { PRIMITIVE_ELEMENT_NAMES } from './primitiveElements';
import {
  FindComponent,
  ResolvedHierarchy,
  createResolvedNode,
  findSourceNode,
} from './traversal';
import { NoyaDiff, NoyaNode, NoyaResolvedNode } from './types';

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
  rootNode: NoyaNode;
  setDiff: (diff: NoyaDiff) => void;
  findComponent: FindComponent;
  resolvedNode?: NoyaResolvedNode;
  highlightedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
}

/**
 * The resolved node already has the diff applied, so we don't need to pass the diff separately.
 */
export const DSLayoutTree = memo(function DSLayoutTree({
  rootNode,
  setDiff,
  findComponent,
  resolvedNode: _resolvedNode,
  highlightedPath,
  setHighlightedPath,
}: Props) {
  const resolvedNode = useMemo(
    () => _resolvedNode ?? createResolvedNode(findComponent, rootNode),
    [_resolvedNode, findComponent, rootNode],
  );

  const flattened = useMemo(
    () => flattenResolvedNode(resolvedNode),
    [resolvedNode],
  );

  return (
    <TreeView.Root
      keyExtractor={(obj) => obj.key}
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
      renderItem={(
        { depth, key, indexPath, node, path },
        index,
        { isDragging },
      ) => (
        <DSLayoutRow
          id={key}
          key={key}
          rootNode={rootNode}
          setDiff={setDiff}
          resolvedNode={resolvedNode}
          findComponent={findComponent}
          highlightedPath={highlightedPath}
          setHighlightedPath={setHighlightedPath}
          depth={depth}
          indexPath={indexPath}
          node={node}
          path={path}
          isDragging={isDragging}
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

const styleItems = allClassNames.map((item) => ({
  name: item,
  id: 'style:' + item,
  icon: <HashtagIcon item={item} />,
}));

export const DSLayoutRow = memo(function DSLayerRow({
  id,
  rootNode,
  setDiff,
  resolvedNode,
  findComponent,
  highlightedPath,
  setHighlightedPath,
  depth,
  indexPath,
  node,
  path,
  isDragging,
}: {
  id: string;
  rootNode: NoyaNode;
  setDiff: (diff: NoyaDiff) => void;
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
}) {
  const theme = useDesignSystemTheme();
  const parent = ResolvedHierarchy.access(resolvedNode, indexPath.slice(0, -1));
  const name = getName(node, findComponent);
  const menu = createSectionedMenu([
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
  ]);
  type MenuItemType = Exclude<
    Extract<(typeof menu)[number], object>['value'],
    undefined
  >;
  const hovered = highlightedPath?.join('/') === path.join('/');

  const onSelectMenuItem = (value: MenuItemType) => {
    switch (value) {
      case 'duplicate': {
        if (rootNode.type === 'noyaString') return;

        const root = findComponent(rootNode.componentID);

        if (!root) return;

        const sourceNode = findSourceNode(findComponent, rootNode, path);

        if (!sourceNode) return;

        if (rootNode.type !== 'noyaCompositeElement') return;

        setDiff(
          Model.diff([
            Model.diffItem({
              path: path.slice(0, -1),
              children: {
                add: [
                  {
                    node: { ...sourceNode, id: uuid() },
                    index: indexPath[indexPath.length - 1] + 1,
                  },
                ],
              },
            }),
          ]),
        );
        break;
      }
      case 'delete': {
        setDiff(
          Model.diff([
            Model.diffItem({
              path: path.slice(0, -1),
              children: { remove: [node.id] },
            }),
          ]),
        );
        break;
      }
      case 'addChild': {
        if (node.type !== 'noyaPrimitiveElement') break;

        setDiff(
          Model.diff([
            Model.diffItem({
              path,
              children: {
                add: [
                  {
                    node: Model.primitiveElement({
                      componentID: boxSymbolId,
                    }),
                    index: node.children.length,
                  },
                ],
              },
            }),
          ]),
        );
        break;
      }
    }
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [isSearching, setIsSearching] = React.useState(false);

  useEffect(() => {
    if (isSearching) {
      searchInputRef.current?.focus();
    }
  }, [isSearching]);

  return (
    <TreeView.Row
      id={id}
      depth={depth - 1}
      menuItems={menu}
      onSelectMenuItem={onSelectMenuItem}
      hovered={(hovered || isMenuOpen) && !isDragging && !isSearching}
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
    >
      <Stack.V
        flex="1 1 0%"
        padding="1px"
        borderRadius="4px"
        margin="2px 0"
        border={
          node.type === 'noyaCompositeElement'
            ? undefined
            : `1px solid ${theme.colors.divider}`
        }
        background={
          node.status === 'removed'
            ? 'rgb(255, 229, 229)'
            : node.status === 'added'
            ? 'rgb(205, 238, 231)'
            : node.type === 'noyaCompositeElement'
            ? 'rgb(238, 229, 255)'
            : undefined
        }
        borderRight={
          node.status === 'added'
            ? `8px solid rgb(205, 238, 231)`
            : node.status === 'removed'
            ? `8px solid rgb(255, 229, 229)`
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
        {isSearching ? (
          <InputFieldWithCompletions
            ref={searchInputRef}
            placeholder={'Find style'}
            items={styleItems}
            onBlur={() => {
              setIsSearching(false);
            }}
            onSelectItem={(item) => {
              setIsSearching(false);

              if (item.id.startsWith('style:')) {
                setDiff(
                  Model.diff([
                    Model.diffItem({
                      path,
                      classNames: {
                        add: [item.name],
                      },
                    }),
                  ]),
                );
              }
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
              onChange={(value) => {
                setDiff(
                  Model.diff([Model.diffItem({ path, textValue: value })]),
                );
              }}
            />
          </InputField.Root>
        ) : (
          <Stack.H padding="4px 6px" alignItems="center">
            <TreeView.RowTitle>{name}</TreeView.RowTitle>
            {hovered ? (
              <Button
                variant="floating"
                onClick={() => {
                  setIsSearching(true);
                }}
              >
                Add Style
              </Button>
            ) : node.type === 'noyaPrimitiveElement' ? (
              <Text variant="code" fontSize="9px">
                {PRIMITIVE_ELEMENT_NAMES[node.componentID]}
              </Text>
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
          <Stack.H flexWrap="wrap" gap="2px">
            {node.classNames.map(({ value, status }) => (
              <Chip
                key={value}
                size={'small'}
                deletable={status !== 'removed'}
                addable={status === 'removed'}
                monospace
                variant={status === 'added' ? 'secondary' : undefined}
                style={{
                  opacity: status === 'removed' ? 0.5 : 1,
                }}
                onDelete={() => {
                  setDiff(
                    Model.diff([{ path, classNames: { remove: [value] } }]),
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
            ))}
          </Stack.H>
        )}
      </Stack.V>
    </TreeView.Row>
  );
});
