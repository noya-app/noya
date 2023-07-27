import cloneDeep from 'lodash/cloneDeep';
import { withOptions } from 'tree-visit';
import {
  NoyaComponent,
  NoyaCompositeElement,
  NoyaDiff,
  NoyaDiffItem,
  NoyaNode,
  NoyaPrimitiveElement,
  NoyaResolvedClassName,
  NoyaResolvedCompositeElement,
  NoyaResolvedNode,
  NoyaResolvedPrimitiveElement,
  NoyaResolvedString,
  NoyaString,
} from './types';

// Doesn't traverse into nested components
export const ElementHierarchy = withOptions<NoyaNode>({
  getChildren: (node) => {
    switch (node.type) {
      case 'noyaString':
        return [];
      case 'noyaCompositeElement':
        return [];
      case 'noyaPrimitiveElement':
        return node.children;
    }
  },
  create: (node: NoyaNode, children: NoyaNode[], ip: number[]) => {
    switch (node.type) {
      case 'noyaString':
        return node;
      case 'noyaCompositeElement':
        return node;
      case 'noyaPrimitiveElement':
        return { ...node, children };
    }
  },
});

function applyClassNamesDiff(
  level: number,
  classNames: NoyaResolvedClassName[],
  { add, remove }: NonNullable<NoyaDiffItem['classNames']>,
) {
  if (remove) {
    const removeKeys = new Set(remove);
    classNames = classNames.flatMap((className) =>
      removeKeys.has(className.value)
        ? level > 0
          ? [{ ...className, status: 'removed' as const }]
          : []
        : [className],
    );
  }

  if (add) {
    classNames = [
      ...classNames,
      ...add.map((className) => ({
        value: className,
        ...(level > 0 && { status: 'added' as const }),
      })),
    ];
  }

  return classNames;
}

function applyChildrenDiff(
  level: number,
  findComponent: FindComponent,
  children: NoyaResolvedNode[],
  { add, remove }: NonNullable<NoyaDiffItem['children']>,
) {
  if (remove) {
    const removeKeys = new Set(remove);
    children = children.flatMap((child) =>
      removeKeys.has(child.id)
        ? level > 0
          ? [{ ...child, status: 'removed' as const }]
          : []
        : [child],
    );
  }

  if (add) {
    children = [
      ...children,
      ...cloneDeep(add).map((child) => ({
        ...createResolvedNode(findComponent, child, [], level),
        status: 'added' as const,
      })),
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
      case 'noyaCompositeElement':
        return [node.rootElement];
      case 'noyaPrimitiveElement':
        return node.children;
    }
  },
});

function applyResolvedDiff(
  findComponent: FindComponent,
  rootNode: NoyaResolvedNode,
  diff: NoyaDiff,
  path: string[],
  level: number,
) {
  return ResolvedHierarchy.map<NoyaResolvedNode>(
    cloneDeep(rootNode),
    (node, transformedChildren) => {
      const nodeKey = node.path.join('/');

      switch (node.type) {
        case 'noyaCompositeElement': {
          const newNode: NoyaResolvedCompositeElement = {
            ...node,
            rootElement: transformedChildren[0],
          };

          return newNode;
        }
        case 'noyaString': {
          const newNode: NoyaResolvedString = {
            ...node,
          };

          diff.items
            .filter((item) => {
              const itemKey = [...path, ...item.path].join('/');

              return itemKey === nodeKey;
            })
            .forEach((item) => {
              if (item.textValue) {
                newNode.value = item.textValue;
              }
            });

          return newNode;
        }
        case 'noyaPrimitiveElement': {
          const newNode: NoyaResolvedPrimitiveElement = {
            ...node,
            children: transformedChildren,
          };

          diff.items
            .filter((item) => {
              const itemKey = [...path, ...item.path].join('/');
              return itemKey === nodeKey;
            })
            .forEach((item) => {
              if (item.children) {
                newNode.children = applyChildrenDiff(
                  level,
                  findComponent,
                  newNode.children,
                  item.children,
                );
              }

              if (item.classNames) {
                newNode.classNames = applyClassNamesDiff(
                  level,
                  newNode.classNames,
                  item.classNames,
                );
              }
            });

          return newNode;
        }
      }
    },
  );
}

export function createResolvedNode(
  findComponent: FindComponent,
  node: NoyaNode,
  parentPath: string[] = [],
  level: number = 2,
): NoyaResolvedNode {
  const path = [...parentPath, node.id];

  switch (node.type) {
    case 'noyaString':
      return { ...node, path };
    case 'noyaPrimitiveElement': {
      const children = node.children.map<NoyaResolvedNode>((child) =>
        createResolvedNode(findComponent, child, path, level),
      );

      const result: NoyaResolvedPrimitiveElement = {
        ...node,
        children,
        path,
        classNames: node.classNames.map((className) => ({ value: className })),
      };

      return result;
    }
    case 'noyaCompositeElement': {
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
        level - 1,
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
          resolvedNode = applyResolvedDiff(
            findComponent,
            resolvedNode,
            variant.diff,
            path,
            level - 1,
          );
        }
      }

      if (node.diff) {
        resolvedNode = applyResolvedDiff(
          findComponent,
          resolvedNode,
          node.diff,
          path,
          level,
        );
      }

      return {
        ...node,
        rootElement: resolvedNode,
        path,
      };
    }
  }
}

// Apply the top level diff onto the underlying composite elements
export function applyTopLevelDiff(component: NoyaComponent, diff: NoyaDiff) {
  return ElementHierarchy.map<NoyaNode>(
    component.rootElement,
    (node, transformedChildren, indexPath) => {
      const path = ElementHierarchy.accessPath(
        component.rootElement,
        indexPath,
      ).map((node) => node.id);

      switch (node.type) {
        case 'noyaString': {
          const items = diff.items.filter(
            (item) => item.path.join('/') === path.join('/'),
          );

          if (!items) return node;

          const newNode: NoyaString = { ...node };

          items.forEach((item) => {
            if (item.textValue) {
              newNode.value = item.textValue;
            }
          });

          return newNode;
        }
        case 'noyaPrimitiveElement': {
          const newNode: NoyaPrimitiveElement = {
            ...node,
            children: transformedChildren,
          };

          return newNode;
        }
        case 'noyaCompositeElement': {
          const items = diff.items.filter((item) =>
            item.path.join('/').startsWith(path.join('/')),
          );

          if (!items) return node;

          const newNode: NoyaCompositeElement = {
            ...node,
            diff: {
              items: [
                ...(node.diff?.items ?? []),
                ...items.map((item) => ({
                  ...item,
                  path: item.path.slice(path.length),
                })),
              ],
            },
          };

          return newNode;
        }
      }
    },
  );
}
