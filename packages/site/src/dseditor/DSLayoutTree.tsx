import {
  Chip,
  InputField,
  Stack,
  Text,
  TreeView,
  createSectionedMenu,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { uuid } from 'noya-utils';
import React, { memo, useMemo } from 'react';
import { DraggableMenuButton } from '../ayon/components/inspector/DraggableMenuButton';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
import { Model } from './builders';
import { mergeDiffs, resetRemovedClassName } from './diff';
import { PRIMITIVE_ELEMENT_NAMES } from './primitiveElements';
import {
  FindComponent,
  ResolvedHierarchy,
  createResolvedNode,
  findSourceNode,
} from './traversal';
import { NoyaCompositeElement, NoyaElement, NoyaResolvedNode } from './types';

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

      if (depth === 0 && node.type === 'noyaCompositeElement') return [];

      if (node.type === 'noyaString') return [];

      return [
        {
          node,
          depth,
          indexPath: indexPath.slice(),
          key: node.path.join('/'),
          path: node.path,
        },
      ];
    },
  );
}

interface Props {
  selection: NoyaElement;
  setSelection: (selection: NoyaElement | undefined) => void;
  findComponent: FindComponent;
  resolvedNode?: NoyaResolvedNode;
  highlightedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
}

export const DSLayoutTree = memo(function DSLayoutTree({
  selection,
  setSelection,
  findComponent,
  resolvedNode: _resolvedNode,
  highlightedPath,
  setHighlightedPath,
}: Props) {
  const resolvedNode = useMemo(
    () => _resolvedNode ?? createResolvedNode(findComponent, selection),
    [_resolvedNode, findComponent, selection],
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
      renderItem={(
        { depth, key, indexPath, node, path },
        index,
        { isDragging },
      ) => (
        <DSLayoutRow
          id={key}
          key={key}
          selection={selection}
          setSelection={setSelection}
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

export const DSLayoutRow = memo(function DSLayerRow({
  id,
  selection,
  setSelection,
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
  selection: NoyaElement;
  setSelection: (selection: NoyaElement | undefined) => void;
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
    depth !== 1 &&
      parent.type === 'noyaPrimitiveElement' && {
        title: 'Duplicate',
        value: 'duplicate',
      },
    depth !== 1 &&
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
        const root = findComponent(selection.componentID);

        if (!root) return;

        const sourceNode = findSourceNode(findComponent, selection, path);

        if (!sourceNode) return;

        if (selection.type !== 'noyaCompositeElement') return;

        const newSelection: NoyaCompositeElement = {
          ...selection,
          diff: mergeDiffs(
            selection.diff,
            Model.diff([
              Model.diffItem({
                path: path.slice(1, -1),
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
          ),
        };

        setSelection(newSelection);
        break;
      }
      case 'delete': {
        if (selection.type !== 'noyaCompositeElement') return;

        const newSelection: NoyaCompositeElement = {
          ...selection,
          diff: mergeDiffs(
            selection.diff,
            Model.diff([
              Model.diffItem({
                path: path.slice(1, -1),
                children: { remove: [node.id] },
              }),
            ]),
          ),
        };

        setSelection(newSelection);
        break;
      }
      case 'addChild': {
        if (node.type !== 'noyaPrimitiveElement') break;

        if (selection.type !== 'noyaCompositeElement') return;

        const newSelection: NoyaCompositeElement = {
          ...selection,
          diff: mergeDiffs(
            selection.diff,
            Model.diff([
              Model.diffItem({
                path: path.slice(1),
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
          ),
        };

        setSelection(newSelection);
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
      hovered={hovered && !isDragging}
      onHoverChange={(hovered) => {
        setHighlightedPath(hovered ? path : undefined);
      }}
      icon={
        depth !== 0 && (
          <DraggableMenuButton items={menu} onSelect={onSelectMenuItem} />
        )
      }
    >
      <Stack.V
        flex="1 1 0%"
        padding="1px"
        overflow="hidden"
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
        {node.type === 'noyaString' ? (
          <InputField.Root>
            <InputField.Input
              style={{
                background: 'transparent',
                color: 'dodgerblue',
              }}
              value={node.value}
              onChange={(value) => {
                if (selection.type !== 'noyaCompositeElement') return;

                const newSelection: NoyaCompositeElement = {
                  ...selection,
                  diff: mergeDiffs(
                    selection.diff,
                    Model.diff([
                      Model.diffItem({
                        path: path.slice(1),
                        textValue: value,
                      }),
                    ]),
                  ),
                };

                setSelection(newSelection);
              }}
            />
          </InputField.Root>
        ) : (
          <Stack.H padding="4px 8px" alignItems="center">
            <TreeView.RowTitle>{name}</TreeView.RowTitle>
            {hovered && node.type === 'noyaPrimitiveElement' ? (
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
                  if (selection.type !== 'noyaCompositeElement') return;

                  const newSelection: NoyaCompositeElement = {
                    ...selection,
                    diff: mergeDiffs(
                      selection.diff,
                      Model.diff([
                        {
                          path: path.slice(1),
                          classNames: { remove: [value] },
                        },
                      ]),
                    ),
                  };

                  setSelection(newSelection);
                }}
                onAdd={() => {
                  if (selection.type !== 'noyaCompositeElement') return;

                  const newSelection: NoyaCompositeElement = {
                    ...selection,
                    diff: resetRemovedClassName(
                      selection.diff,
                      path.slice(1),
                      value,
                    ),
                  };

                  setSelection(newSelection);
                }}
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
