import cloneDeep from 'lodash/cloneDeep';
import { withOptions } from 'tree-visit';
import {
  NoyaComponent,
  NoyaDiff,
  NoyaDiffItem,
  NoyaNode,
  NoyaResolvedNode,
  NoyaResolvedPrimitiveElement,
} from './types';

function applyClassNamesDiff(
  classNames: string[],
  { add, remove }: NonNullable<NoyaDiffItem['classNames']>,
) {
  if (remove) {
    classNames = classNames.filter((className) => !remove.includes(className));
  }

  if (add) {
    classNames = [...classNames, ...add];
  }

  return classNames;
}

function applyChildrenDiff(
  findComponent: FindComponent,
  children: NoyaResolvedNode[],
  { add, remove }: NonNullable<NoyaDiffItem['children']>,
) {
  if (remove) {
    children = children.filter((child) => child && !remove?.includes(child.id));
  }

  if (add) {
    children = [
      ...children,
      ...cloneDeep(add).map((child) =>
        createResolvedNode(findComponent, child, []),
      ),
    ];
  }

  return children;
}

export type FindComponent = (id: string) => NoyaComponent | undefined;

export const ResolvedHierarchy = withOptions<NoyaResolvedNode>({
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
  findComponent: FindComponent,
  rootNode: NoyaResolvedNode,
  diff: NoyaDiff,
  path: string[],
) {
  return ResolvedHierarchy.map<NoyaResolvedNode>(
    cloneDeep(rootNode),
    (node, transformedChildren) => {
      if (node?.type !== 'noyaPrimitiveElement') return node;

      const newNode: NoyaResolvedPrimitiveElement = {
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
          if (item.children) {
            newNode.children = applyChildrenDiff(
              findComponent,
              newNode.children,
              item.children,
            );
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

export function createResolvedNode(
  findComponent: FindComponent,
  node: NoyaNode,
  parentPath: string[],
): NoyaResolvedNode {
  if (node.type === 'noyaString') return node;

  const path = [...parentPath, node.id];

  if (node.type === 'noyaPrimitiveElement') {
    const children = node.children.map<NoyaResolvedNode>((child) =>
      createResolvedNode(findComponent, child, path),
    );

    const result: NoyaResolvedPrimitiveElement = {
      ...node,
      children,
      path,
    };

    return result;
  }

  if (node.type === 'noyaCompositeElement') {
    const component = findComponent(node.componentID);

    if (!component) {
      throw new Error(
        `Failed to resolve composite element ${node.name} with Component ID ${node.componentID}`,
      );
    }

    let resolvedNode = createResolvedNode(
      findComponent,
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
          findComponent,
          resolvedNode,
          variant.diff,
          path,
        );
      }
    }

    if (node.diff) {
      resolvedNode = applyEditableDiff(
        findComponent,
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
