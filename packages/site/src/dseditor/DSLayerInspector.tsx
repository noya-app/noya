import {
  Chip,
  InputField,
  ScrollArea,
  Stack,
  Text,
  TreeView,
  useDesignSystemTheme,
} from 'noya-designsystem';
import React, { useCallback, useMemo } from 'react';
import { DraggableMenuButton } from '../ayon/components/inspector/DraggableMenuButton';
import { InspectorSection } from '../components/InspectorSection';
import {
  EditableTreeItem,
  PRIMITIVE_ELEMENT_NAMES,
  createEditableTree,
  initialComponents,
} from './traversal';
import { NoyaComponentOperation } from './types';

interface Props {
  selectedComponentId: string;
}

export function DSLayerInspector({ selectedComponentId }: Props) {
  const theme = useDesignSystemTheme();

  const getCompositeComponent = useCallback(
    (id: string) =>
      initialComponents.find((component) => component.componentID === id),
    [],
  );

  const component = getCompositeComponent(selectedComponentId)!;

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
    ops: NoyaComponentOperation[];
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
        item.type === 'noyaComponent' && item.diff ? item.diff.operations : [],
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

  return (
    <Stack.V width="400px" background="white">
      <ScrollArea>
        <Stack.V gap="1px" background={theme.colors.canvas.background}>
          <InspectorSection title="Component" titleTextStyle="heading3">
            <InputField.Root>
              <InputField.Label>Name</InputField.Label>
              <InputField.Input value={component.name} onChange={() => {}} />
            </InputField.Root>
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
                    .filter((op) => op.path.join('/') === path)
                    .forEach((op) => {
                      if (op.type === 'addParameters') {
                        classNames = [
                          ...classNames,
                          ...op.value.map((className) => ({
                            name: className,
                            status: 'added' as const,
                          })),
                        ];
                      } else if (op.type === 'removeParameters') {
                        classNames = classNames.map((className) => ({
                          ...className,
                          status: op.value.includes(className.name)
                            ? ('deleted' as const)
                            : className.status,
                        }));
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
