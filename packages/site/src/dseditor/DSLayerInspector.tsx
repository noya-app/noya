import {
  Chip,
  InputField,
  ScrollArea,
  Select,
  Stack,
  Text,
  TreeView,
  useDesignSystemTheme,
} from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import React, { useMemo } from 'react';
import { DraggableMenuButton } from '../ayon/components/inspector/DraggableMenuButton';
import { InspectorSection } from '../components/InspectorSection';
import { Model } from './builders';
import { PRIMITIVE_ELEMENT_NAMES } from './builtins';
import {
  FindComponent,
  ResolvedHierarchy,
  createResolvedNode,
} from './traversal';
import {
  NoyaDiffItem,
  NoyaResolvedNode,
  NoyaVariant,
  SelectedComponent,
} from './types';

type LayerTreeItem = {
  depth: number;
  indexPath: number[];
  key: string;
  node: NoyaResolvedNode;
  path: string;
  ops: NoyaDiffItem[];
};

interface Props {
  selectedComponent: SelectedComponent;
  setSelectedComponent: (component: SelectedComponent | undefined) => void;
  findComponent: FindComponent;
}

function getName(node: NoyaResolvedNode, findComponent: FindComponent): string {
  switch (node.type) {
    case 'noyaString':
      return JSON.stringify(node.value);
    case 'noyaPrimitiveElement':
      return node.name ?? PRIMITIVE_ELEMENT_NAMES[node.componentID];
    case 'noyaCompositeElement': {
      const component = findComponent(node.componentID);

      if (!component) return '<Component Not Found>';

      return node.name ?? component.name ?? '<No Name>';
    }
  }
}

export function DSLayerInspector({
  selectedComponent,
  setSelectedComponent,
  findComponent,
}: Props) {
  const theme = useDesignSystemTheme();

  const component = findComponent(selectedComponent.componentID)!;

  const editableNode = createResolvedNode(
    findComponent,
    Model.compositeElement({
      id: 'root',
      componentID: selectedComponent.componentID,
      variantID: selectedComponent.variantID,
    }),
    [],
  );

  const flattened = ResolvedHierarchy.flatMap(
    editableNode,
    (item, indexPath): LayerTreeItem[] => {
      const depth = indexPath.length;

      if (depth === 0) return [];

      return [
        {
          node: item,
          depth,
          indexPath: indexPath.slice(),
          key: component.type + ':' + indexPath.join('/'),
          path: item.type === 'noyaString' ? '' : item.path.join('/'),
          ops: [],
        },
      ];
    },
  );

  const [hoveredItemId, setHoveredItemId] = React.useState<
    string | undefined
  >();

  const variantsWithDefault = useMemo(
    (): (NoyaVariant | undefined)[] => [
      undefined,
      ...(component.variants ?? []),
    ],
    [component.variants],
  );

  return (
    <Stack.V width="400px" background="white">
      <ScrollArea>
        <Stack.V gap="1px" background={theme.colors.canvas.background}>
          <InspectorSection title="Component" titleTextStyle="heading3">
            <InspectorPrimitives.LabeledRow label="Name">
              <InputField.Root>
                <InputField.Label>Name</InputField.Label>
                <InputField.Input value={component.name} onChange={() => {}} />
              </InputField.Root>
            </InspectorPrimitives.LabeledRow>
            <InspectorPrimitives.LabeledRow label="Variant">
              <Select
                value={selectedComponent.variantID ?? 'default'}
                id="variant-input"
                options={variantsWithDefault.map(
                  (variant) => variant?.id ?? 'default',
                )}
                getTitle={(id) => {
                  const variant = component.variants?.find(
                    (variant) => variant.id === id,
                  );
                  return variant?.name ?? 'Default';
                }}
                onChange={(id) => {
                  setSelectedComponent({
                    componentID: component.componentID,
                    ...(id !== 'default' && { variantID: id }),
                  });
                }}
              />
            </InspectorPrimitives.LabeledRow>
          </InspectorSection>
          <InspectorSection title="Elements" titleTextStyle="heading4">
            <TreeView.Root
              keyExtractor={(obj, index) => obj.key}
              data={flattened}
              expandable={false}
              variant="bare"
              indentation={24}
              sortable
              pressEventName="onPointerDown"
              renderItem={(
                { depth, key, indexPath, node, ops, path },
                index,
                { isDragging },
              ) => {
                const name = getName(node, findComponent);

                let classNames: {
                  name: string;
                  status?: 'added' | 'deleted';
                }[] = [];

                if (node.type === 'noyaPrimitiveElement') {
                  classNames = node.classNames.map((className) => ({
                    name: className,
                  }));
                }

                if (ops) {
                  ops
                    .filter((item) => item.path.join('/') === path)
                    .forEach((item) => {
                      if (item.classNames?.remove) {
                        classNames = classNames.map((className) => ({
                          ...className,
                          status: item.classNames?.remove?.includes(
                            className.name,
                          )
                            ? ('deleted' as const)
                            : className.status,
                        }));
                      }

                      if (item.classNames?.add) {
                        classNames = [
                          ...classNames,
                          ...item.classNames.add.map((className) => ({
                            name: className,
                            status: 'added' as const,
                          })),
                        ];
                      }
                    });
                }

                return (
                  <TreeView.Row
                    key={key}
                    id={key}
                    depth={depth - 1}
                    onHoverChange={(hovered) =>
                      setHoveredItemId(hovered ? key : undefined)
                    }
                    icon={
                      depth !== 0 && (
                        <DraggableMenuButton items={[]} onSelect={() => {}} />
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
                        node.type !== 'noyaCompositeElement'
                          ? `1px solid ${theme.colors.divider}`
                          : undefined
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
                      <Stack.H padding="4px 8px" alignItems="center">
                        <TreeView.RowTitle>{name}</TreeView.RowTitle>
                        {hoveredItemId === key &&
                          node.type === 'noyaPrimitiveElement' && (
                            <Text variant="code" fontSize="9px">
                              {PRIMITIVE_ELEMENT_NAMES[node.componentID]}
                            </Text>
                          )}
                      </Stack.H>
                      {node.type === 'noyaPrimitiveElement' && (
                        <Stack.H flexWrap="wrap" gap="2px">
                          {classNames.map(({ name, status }) => (
                            <Chip
                              key={name}
                              size={'small'}
                              deletable={status !== 'deleted'}
                              addable={status === 'deleted'}
                              monospace
                              variant={
                                status === 'added' ? 'secondary' : undefined
                              }
                              style={{
                                opacity: status === 'deleted' ? 0.5 : 1,
                              }}
                            >
                              {name}
                            </Chip>
                          ))}
                        </Stack.H>
                      )}
                    </Stack.V>
                  </TreeView.Row>
                );
              }}
            />
          </InspectorSection>
        </Stack.V>
      </ScrollArea>
    </Stack.V>
  );
}
