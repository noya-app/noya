import {
  Chip,
  InputField,
  ScrollArea,
  Stack,
  TreeView,
  useDesignSystemTheme,
} from 'noya-designsystem';
import React, { useCallback, useMemo } from 'react';
import { DraggableMenuButton } from '../ayon/components/inspector/DraggableMenuButton';
import { InspectorSection } from '../components/InspectorSection';
import {
  EditableTreeItem,
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
                    : item.name ?? item.id; //  + `(${item.id})`

                let classNames: { name: string; status?: 'added' }[] = [];

                if (item.type === 'noyaPrimitiveElement') {
                  classNames = item.classNames.map((className) => ({
                    name: className,
                  }));
                }

                if (ops) {
                  ops
                    .filter((op) => op.path.join('/') === path)
                    .forEach((op) => {
                      if (op.type === 'setParameters') {
                        classNames = op.value.map((className) => ({
                          name: className,
                          status: 'added',
                        }));
                      }
                    });
                }

                return (
                  <TreeView.Row
                    key={key}
                    id={key}
                    depth={depth}
                    icon={
                      <DraggableMenuButton items={[]} onSelect={() => {}} />
                    }
                  >
                    <Stack.V
                      flex="1 1 0%"
                      padding="1px"
                      overflow="hidden"
                      borderRadius="4px"
                      margin="2px 0"
                      border={`1px solid ${theme.colors.divider}`}
                      color={
                        item.type === 'noyaString'
                          ? 'dodgerblue'
                          : item.type === 'noyaComponent'
                          ? theme.colors.primary
                          : 'inherit'
                      }
                    >
                      <Stack.H padding="4px 8px">
                        <TreeView.RowTitle>{name}</TreeView.RowTitle>
                      </Stack.H>
                      {item.type === 'noyaPrimitiveElement' && (
                        <Stack.H flexWrap="wrap" gap="2px">
                          {classNames.map(({ name, status }) => (
                            <Chip
                              key={name}
                              size={'small'}
                              deletable
                              monospace
                              variant={
                                status === 'added' ? 'secondary' : undefined
                              }
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
