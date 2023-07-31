import {
  Chip,
  InputField,
  Stack,
  Text,
  TreeView,
  createSectionedMenu,
  useDesignSystemTheme,
} from 'noya-designsystem';
import React, { memo } from 'react';
import { DraggableMenuButton } from '../ayon/components/inspector/DraggableMenuButton';
import { boxSymbolId } from '../ayon/symbols/symbolIds';
import { Model } from './builders';
import { PRIMITIVE_ELEMENT_NAMES } from './builtins';
import { mergeDiffs, resetRemovedClassName } from './diff';
import { FindComponent, ResolvedHierarchy } from './traversal';
import { NoyaCompositeElement, NoyaResolvedNode } from './types';

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

export const DSLayerRow = memo(function DSLayerRow({
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
  selection: NoyaCompositeElement;
  setSelection: (component: NoyaCompositeElement | undefined) => void;
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
  const menu = createSectionedMenu(
    node.type !== 'noyaString' && [
      node.type === 'noyaPrimitiveElement' && {
        title: 'Add Child',
        value: 'addChild',
      },
      depth !== 1 && { title: 'Duplicate', value: 'duplicate' },
      depth !== 1 &&
        parent.type !== 'noyaCompositeElement' && {
          title: 'Delete',
          value: 'delete',
        },
    ],
  );
  type MenuItemType = Exclude<
    Extract<typeof menu[number], object>['value'],
    undefined
  >;
  const hovered = highlightedPath?.join('/') === path.join('/');

  const onSelectMenuItem = (value: MenuItemType) => {
    switch (value) {
      case 'duplicate':
        break;
      case 'delete': {
        const newSelection: NoyaCompositeElement = {
          ...selection,
          diff: mergeDiffs(
            selection.diff,
            Model.diff([
              {
                path: path.slice(1, -1),
                children: { remove: [node.id] },
              },
            ]),
          ),
        };

        setSelection(newSelection);
        break;
      }
      case 'addChild': {
        if (node.type !== 'noyaPrimitiveElement') break;

        const newSelection: NoyaCompositeElement = {
          ...selection,
          diff: mergeDiffs(
            selection.diff,
            Model.diff([
              {
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
              },
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
