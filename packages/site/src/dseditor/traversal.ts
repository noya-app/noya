import cloneDeep from 'lodash/cloneDeep';
import { withOptions } from 'tree-visit';
import { Model } from './builders';
import { equalPaths, mergeDiffs } from './diff';
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
  path: string[],
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
    const clone = children.slice();

    add.forEach(({ node, index }) => {
      clone.splice(index, 0, {
        ...createResolvedNode(findComponent, node, path, level),
        status: 'added' as const,
      });
    });

    children = clone;
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
              if (item.textValue !== undefined) {
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
                  [...path, ...item.path],
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

// Embed the top level diff onto the underlying composite elements
export function embedRootLevelDiff(rootElement: NoyaNode, diff: NoyaDiff) {
  return ElementHierarchy.map<NoyaNode>(
    rootElement,
    (node, transformedChildren, indexPath) => {
      const path = ElementHierarchy.accessPath(rootElement, indexPath).map(
        (node) => node.id,
      );

      switch (node.type) {
        case 'noyaString': {
          const items = diff.items.filter((item) =>
            equalPaths(item.path, path),
          );

          if (items.length === 0) return node;

          const newNode: NoyaString = {
            ...node,
            value: items.reduce((result, item) => {
              if (item.textValue !== undefined) {
                return item.textValue;
              } else {
                return result;
              }
            }, node.value),
          };

          return newNode;
        }
        case 'noyaPrimitiveElement': {
          // We don't attempt to exit earlier, since we still need to return a
          // new node with the updated children
          const item = diff.items.find((item) => equalPaths(item.path, path));

          let children = [...transformedChildren];

          if (item?.children) {
            const { add, remove } = item.children;

            if (remove) {
              const removeKeys = new Set(remove);

              children = children.filter((child) => !removeKeys.has(child.id));
            }

            if (add) {
              add.forEach(({ node, index }) => {
                children.splice(index, 0, node);
              });
            }
          }

          const newNode: NoyaPrimitiveElement = {
            ...node,
            classNames: applyClassNamesDiff(
              0,
              node.classNames.map((className) => ({ value: className })),
              item?.classNames || {},
            ).map((className) => className.value),
            children,
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
            diff: mergeDiffs(
              node.diff,
              Model.diff(
                items.map((item) => ({
                  ...item,
                  path: item.path.slice(path.length),
                })),
              ),
            ),
          };

          return newNode;
        }
      }
    },
  );
}
