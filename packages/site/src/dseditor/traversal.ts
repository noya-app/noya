import cloneDeep from 'lodash/cloneDeep';
import { withOptions } from 'tree-visit';
import {
  NoyaComponent,
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

export function getIdPath(resolved: NoyaResolvedNode, indexPath: number[]) {
  const idPath = ResolvedElementHierarchy.accessPath(resolved, indexPath)
    .map((el) => el?.id ?? '-')
    .join('/');

  return idPath;
}

export type GetCompositeComponent = (id: string) => NoyaComponent | undefined;

export function resolveComponentHierarchy(
  getCompositeComponent: GetCompositeComponent,
  node: NoyaNode,
): NoyaResolvedNode {
  if (node.type === 'noyaString') return node;

  if (node.type === 'noyaPrimitiveElement') {
    const children = node.children.map<NoyaResolvedNode>((child) =>
      resolveComponentHierarchy(getCompositeComponent, child),
    );

    return {
      ...node,
      children,
    };
  }

  if (node.type === 'noyaCompositeElement') {
    const component = getCompositeComponent(node.componentID);

    if (!component) {
      throw new Error(
        `Failed to resolve composite element ${node.name} with Component ID ${node.componentID}`,
      );
    }

    const resolvedNode = resolveComponentHierarchy(
      getCompositeComponent,
      component.rootElement,
    );

    const diff = node.diff;

    if (!diff) return resolvedNode;

    return ResolvedElementHierarchy.map(
      cloneDeep(resolvedNode),
      (node, transformedChildren, indexPath) => {
        if (node?.type !== 'noyaPrimitiveElement') return node;

        const idPath = getIdPath(resolvedNode, indexPath);

        const newNode: NoyaResolvedElement = {
          ...node,
          children: transformedChildren,
        };

        diff.operations
          .filter((op) => op.path.join('/') === idPath)
          .forEach((operation) => {
            if (operation.type === 'addParameters') {
              newNode.classNames = [...newNode.classNames, ...operation.value];
            } else if (operation.type === 'removeParameters') {
              newNode.classNames = newNode.classNames.filter(
                (className) => !operation.value.includes(className),
              );
            }
          });

        return newNode;
      },
    );
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
