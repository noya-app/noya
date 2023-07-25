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
import React, { useCallback, useMemo } from 'react';
import { DraggableMenuButton } from '../ayon/components/inspector/DraggableMenuButton';
import { InspectorSection } from '../components/InspectorSection';
import { PRIMITIVE_ELEMENT_NAMES, initialComponents } from './builtins';
import { EditableTreeItem, createEditableTree } from './traversal';
import { NoyaDiffItem, NoyaVariant, SelectedComponent } from './types';

interface Props {
  selectedComponent: SelectedComponent;
  setSelectedComponent: (component: SelectedComponent | undefined) => void;
}

export function DSLayerInspector({
  selectedComponent,
  setSelectedComponent,
}: Props) {
  const theme = useDesignSystemTheme();

  const getCompositeComponent = useCallback(
    (id: string) =>
      initialComponents.find((component) => component.componentID === id),
    [],
  );

  const component = getCompositeComponent(selectedComponent.componentID)!;

  // const resolved = useMemo(() => {
  //   const rootComponent = getCompositeComponent(selectedComponentId);

  //   if (!rootComponent) return null;

  //   const resolved = resolveComponentHierarchy(
  //     getCompositeComponent,
  //     Model.compositeElement(rootComponent.componentID),
  //   );

  //   return resolved;
  // }, [getCompositeComponent, selectedComponentId]);

  type LayerTreeItem = {
    depth: number;
    indexPath: number[];
    key: string;
    item: EditableTreeItem;
    path: string;
    ops: NoyaDiffItem[];
  };

  const EditableTreeHierarchy = useMemo(
    () => createEditableTree(getCompositeComponent),
    [getCompositeComponent],
  );

  const flattened = EditableTreeHierarchy.flatMap(
    component,
    (item, indexPath): LayerTreeItem[] => {
      const depth = indexPath.length;

      // if (depth === 0) return [];

      const diffOps = EditableTreeHierarchy.accessPath(
        component,
        indexPath,
      ).flatMap((item) =>
        item.type === 'noyaCompositeElement' && item.diff
          ? item.diff.items
          : [],
      );

      const idPathElements = EditableTreeHierarchy.accessPath(
        component,
        indexPath,
      ).flatMap((item) =>
        item.type === 'noyaPrimitiveElement' ? [item.id] : [],
      );

      // console.log(diffOps, idPathElements);

      const path = idPathElements.join('/');

      return [
        {
          item,
          depth,
          indexPath: indexPath.slice(),
          key: component.type + ':' + indexPath.join('/'),
          path,
          ops: diffOps,
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
                    variantID: id,
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
                { depth, key, indexPath, item, ops, path },
                index,
                { isDragging },
              ) => {
                const name =
                  item.type === 'noyaString'
                    ? JSON.stringify(item.value)
                    : item.type === 'noyaPrimitiveElement'
                    ? item.name ?? PRIMITIVE_ELEMENT_NAMES[item.componentID]
                    : item.name ?? item.id; //  + `(${item.id})`

                let classNames: {
                  name: string;
                  status?: 'added' | 'deleted';
                }[] = [];

                if (item.type === 'noyaPrimitiveElement') {
                  classNames = item.classNames.map((className) => ({
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
                        item.type !== 'noyaComponent'
                          ? `1px solid ${theme.colors.divider}`
                          : undefined
                      }
                      background={
                        item.type === 'noyaComponent'
                          ? 'rgb(238, 229, 255)'
                          : undefined
                      }
                      color={
                        item.type === 'noyaString'
                          ? 'dodgerblue'
                          : item.type === 'noyaComponent'
                          ? theme.colors.primary
                          : 'inherit'
                      }
                    >
                      <Stack.H padding="4px 8px" alignItems="center">
                        <TreeView.RowTitle>{name}</TreeView.RowTitle>
                        {hoveredItemId === key &&
                          item.type === 'noyaPrimitiveElement' && (
                            <Text variant="code" fontSize="9px">
                              {PRIMITIVE_ELEMENT_NAMES[item.componentID]}
                            </Text>
                          )}
                      </Stack.H>
                      {hoveredItemId === key && (
                        <Text variant="code" fontSize="9px">
                          {path}
                        </Text>
                      )}
                      {item.type === 'noyaPrimitiveElement' && (
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
