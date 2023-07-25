import cloneDeep from 'lodash/cloneDeep';
import { withOptions } from 'tree-visit';
import {
  NoyaComponent,
  NoyaDiff,
  NoyaNode,
  NoyaResolvedElement,
  NoyaResolvedNode,
} from './types';

// const CompositeElementHierarchy = withOptions<NoyaNode>({
//   getChildren: (node) => {
//     if (
//       node.type === 'noyaString' ||
//       node.type === 'noyaCompositeElement'
//     ) {
//       return [];
//     }

//     return node.children;
//   },
// });

export const ResolvedElementHierarchy = withOptions<NoyaResolvedNode>({
  getChildren: (node) => {
    if (!node) return [];

    if (node.type === 'noyaString') {
      return [];
    }

    return node.children;
  },
});

function applyDiff(
  getCompositeComponent: GetCompositeComponent,
  resolvedNode: NoyaResolvedNode,
  diff: NoyaDiff,
  path: string[],
) {
  return ResolvedElementHierarchy.map<NoyaResolvedNode>(
    cloneDeep(resolvedNode),
    (node, transformedChildren, indexPath) => {
      if (node?.type !== 'noyaPrimitiveElement') return node;

      const newNode: NoyaResolvedElement = {
        ...node,
        children: transformedChildren,
      };

      const nodeKey = newNode.path.join('/');

      diff.items
        .filter((item) => {
          const itemKey = [...path, ...item.path].join('/');

          return itemKey === nodeKey;
        })
        .forEach((item) => {
          if (item.children?.remove) {
            newNode.children = newNode.children.filter(
              (child) => child && !item.children?.remove?.includes(child.id),
            );
          }

          if (item.children?.add) {
            newNode.children = [
              ...newNode.children,
              ...cloneDeep(item.children.add).map((child) =>
                resolveComponentHierarchy(getCompositeComponent, child, []),
              ),
            ].filter((child) => child);
          }

          if (item.classNames?.remove) {
            newNode.classNames = newNode.classNames.filter(
              (className) => !item.classNames?.remove?.includes(className),
            );
          }

          if (item.classNames?.add) {
            newNode.classNames = [
              ...newNode.classNames,
              ...item.classNames.add,
            ];
          }
        });

      return newNode;
    },
  );
}

export type GetCompositeComponent = (id: string) => NoyaComponent | undefined;

export function resolveComponentHierarchy(
  getCompositeComponent: GetCompositeComponent,
  node: NoyaNode,
  parentPath: string[],
): NoyaResolvedNode {
  if (node.type === 'noyaString') return node;

  const path = [...parentPath, node.id];

  if (node.type === 'noyaPrimitiveElement') {
    const children = node.children.map<NoyaResolvedNode>((child) =>
      resolveComponentHierarchy(getCompositeComponent, child, path),
    );

    return {
      ...node,
      children,
      path,
    };
  }

  if (node.type === 'noyaCompositeElement') {
    const component = getCompositeComponent(node.componentID);

    if (!component) {
      throw new Error(
        `Failed to resolve composite element ${node.name} with Component ID ${node.componentID}`,
      );
    }

    let resolvedNode = resolveComponentHierarchy(
      getCompositeComponent,
      component.rootElement,
      path,
    );

    if (node.variantID) {
      const variant = component.variants?.find(
        (variant) => variant.id === node.variantID,
      );

      if (!variant) {
        console.info(
          `Failed to resolve variant ${node.variantID} for component ${component.name}`,
        );
      }

      if (variant) {
        resolvedNode = applyDiff(
          getCompositeComponent,
          resolvedNode,
          variant.diff,
          path,
        );
      }
    }

    if (node.diff) {
      resolvedNode = applyDiff(
        getCompositeComponent,
        resolvedNode,
        node.diff,
        path,
      );
    }

    return resolvedNode;
  }

  return null;
}

export type EditableTreeItem = NoyaComponent | NoyaNode;

// export const EditableTreeHierarchy = withOptions<EditableTreeItem>({
//   getChildren(item: NoyaComponent | NoyaNode): EditableTreeItem[] {
//     switch (item.type) {
//       case 'noyaComponent':
//         return [item.rootElement];
//       case 'noyaCompositeElement': {
//         return [];
//       }
//       case 'noyaPrimitiveElement':
//         return item.children;
//       case 'noyaString':
//         return [];
//     }
//   },
// });

export function createEditableTree(
  getCompositeComponent: GetCompositeComponent,
) {
  // function resolveCompositeElement(
  //   node: NoyaCompositeElement,
  // ): NoyaResolvedElement | NoyaString {
  //   const component = getCompositeComponent(node.componentID);

  //   if (!component) {
  //     throw new Error(
  //       `Failed to resolve composite element ${node.name} with Component ID ${node.componentID}`,
  //     );
  //   }

  //   const resolvedNode = resolveCompositeElement(component.rootElement);

  // }

  return withOptions<EditableTreeItem>({
    getChildren(item: EditableTreeItem): EditableTreeItem[] {
      switch (item.type) {
        case 'noyaComponent': {
          const root = item.rootElement;

          if (root.type === 'noyaCompositeElement') {
            const component = getCompositeComponent(root.componentID);

            return component ? [component] : [];
          }

          return [item.rootElement];
        }
        case 'noyaCompositeElement': {
          return [getCompositeComponent(item.componentID)!];
        }
        case 'noyaPrimitiveElement': {
          return item.children.flatMap((child): EditableTreeItem[] => {
            if (child.type === 'noyaCompositeElement') {
              const component = getCompositeComponent(child.componentID);

              return component ? [component] : [];
            }

            return [child];
          });
        }
        case 'noyaString':
          return [];
      }
    },
  });
}
