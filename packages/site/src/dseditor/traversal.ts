import cloneDeep from 'lodash/cloneDeep';
import { withOptions } from 'tree-visit';
import {
  NoyaComponent,
  NoyaDiff,
  NoyaDiffItem,
  NoyaEditableNode,
  NoyaEditablePrimitiveElement,
  NoyaNode,
  NoyaResolvedElement,
  NoyaResolvedNode,
} from './types';

export const ResolvedElementHierarchy = withOptions<NoyaResolvedNode>({
  getChildren: (node) => {
    if (!node) return [];

    if (node.type === 'noyaString') {
      return [];
    }

    return node.children;
  },
});

function applyClassNamesDiff(
  classNames: string[],
  diff: NoyaDiffItem['classNames'],
) {
  if (!diff) return classNames;

  if (diff.remove) {
    classNames = classNames.filter(
      (className) => !diff.remove?.includes(className),
    );
  }

  if (diff.add) {
    classNames = [...classNames, ...diff.add];
  }

  return classNames;
}

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
            ];
          }

          if (item.classNames) {
            newNode.classNames = applyClassNamesDiff(
              newNode.classNames,
              item.classNames,
            );
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

export const EditableHierarchy = withOptions<NoyaEditableNode>({
  getChildren: (node) => {
    switch (node.type) {
      case 'noyaString':
        return [];
      case 'noyaCompositeElement': {
        return [node.rootElement];
      }
      case 'noyaPrimitiveElement':
        return node.children;
    }
  },
});

function applyEditableDiff(
  getCompositeComponent: GetCompositeComponent,
  rootNode: NoyaEditableNode,
  diff: NoyaDiff,
  path: string[],
) {
  return EditableHierarchy.map<NoyaEditableNode>(
    cloneDeep(rootNode),
    (node, transformedChildren, indexPath) => {
      if (node?.type !== 'noyaPrimitiveElement') return node;

      const newNode: NoyaEditablePrimitiveElement = {
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
                createEditableNode(getCompositeComponent, child, []),
              ),
            ];
          }

          if (item.classNames) {
            newNode.classNames = applyClassNamesDiff(
              newNode.classNames,
              item.classNames,
            );
          }
        });

      return newNode;
    },
  );
}

export function createEditableNode(
  getCompositeComponent: GetCompositeComponent,
  node: NoyaNode,
  parentPath: string[],
): NoyaEditableNode {
  if (node.type === 'noyaString') return node;

  const path = [...parentPath, node.id];

  if (node.type === 'noyaPrimitiveElement') {
    const children = node.children.map<NoyaEditableNode>((child) =>
      createEditableNode(getCompositeComponent, child, path),
    );

    const result: NoyaEditablePrimitiveElement = {
      ...node,
      children,
      path,
    };

    return result;
  }

  if (node.type === 'noyaCompositeElement') {
    const component = getCompositeComponent(node.componentID);

    if (!component) {
      throw new Error(
        `Failed to resolve composite element ${node.name} with Component ID ${node.componentID}`,
      );
    }

    let resolvedNode = createEditableNode(
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
        resolvedNode = applyEditableDiff(
          getCompositeComponent,
          resolvedNode,
          variant.diff,
          path,
        );
      }
    }

    if (node.diff) {
      resolvedNode = applyEditableDiff(
        getCompositeComponent,
        resolvedNode,
        node.diff,
        path,
      );
    }

    return {
      ...node,
      rootElement: resolvedNode,
      path,
    };
  }

  throw new Error(`Unknown node type ${JSON.stringify(node)}`);
}
