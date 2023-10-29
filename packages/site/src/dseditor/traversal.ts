import cloneDeep from 'lodash/cloneDeep';
import { RelativeDropPosition } from 'noya-designsystem';
import { defineTree } from 'tree-visit';
import { applyArrayDiff, computeArrayDiff, mapArrayDiff } from './arrayDiff';
import { Model } from './builders';
import { ResolvedHierarchy } from './resolvedHierarchy';
import {
  NoyaComponent,
  NoyaCompositeElement,
  NoyaDiff,
  NoyaDiffItem,
  NoyaNode,
  NoyaPrimitiveElement,
  NoyaResolvedCompositeElement,
  NoyaResolvedNode,
  NoyaResolvedPrimitiveElement,
  NoyaResolvedString,
  NoyaString,
  SelectedComponent,
} from './types';

// Doesn't traverse into nested components
export const ElementHierarchy = defineTree<NoyaNode>({
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
}).withOptions({
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

export type FindComponent = (id: string) => NoyaComponent | undefined;

export function handleMoveItem(
  root: NoyaResolvedNode,
  position: RelativeDropPosition,
  sourceIndexPath: number[],
  destinationIndexPath: number[],
) {
  function inner() {
    switch (position) {
      case 'above': {
        return ResolvedHierarchy.move(root, {
          indexPaths: [sourceIndexPath],
          to: destinationIndexPath,
        });
      }
      case 'below': {
        return ResolvedHierarchy.move(root, {
          indexPaths: [sourceIndexPath],
          to: [
            ...destinationIndexPath.slice(0, -1),
            destinationIndexPath.at(-1)! + 1,
          ],
        });
      }
      case 'inside': {
        return ResolvedHierarchy.move(root, {
          indexPaths: [sourceIndexPath],
          to: [...destinationIndexPath, 0],
        });
      }
    }
  }

  return inner();
}

export function unresolve(resolvedNode: NoyaResolvedNode): NoyaNode {
  switch (resolvedNode.type) {
    case 'noyaString': {
      const { id, value, type, name } = resolvedNode;

      const node: NoyaString = {
        id,
        value,
        type,
        name,
      };

      return node;
    }
    case 'noyaCompositeElement': {
      const { id, name, type, componentID, diff, variantID } = resolvedNode;

      const node: NoyaCompositeElement = {
        id,
        name,
        type,
        componentID,
        variantID,
        diff,
      };

      return node;
    }
    case 'noyaPrimitiveElement': {
      const { id, name, classNames, props, children, componentID, type } =
        resolvedNode;

      const node: NoyaPrimitiveElement = {
        id,
        name,
        type,
        componentID,
        props,
        classNames,
        children: children.map((child) => unresolve(child)),
      };

      return node;
    }
  }
}

function isEmptyDiff(diff: NoyaDiffItem) {
  return (
    diff.name === undefined &&
    diff.componentID === undefined &&
    diff.textValue === undefined &&
    !diff.classNames &&
    !diff.children
  );
}

export function diffResolvedTrees(
  a: NoyaResolvedNode,
  b: NoyaResolvedNode,
): NoyaDiff {
  const currentItem = Model.diffItem({ path: a.path });

  if (a.name !== b.name) {
    currentItem.name = b.name;
  }

  if (a.type === 'noyaString' && b.type === 'noyaString') {
    if (a.value !== b.value) {
      currentItem.textValue = b.value;
    }
  } else if (
    a.type === 'noyaPrimitiveElement' &&
    b.type === 'noyaPrimitiveElement'
  ) {
    if (a.componentID !== b.componentID) {
      currentItem.componentID = b.componentID;
    }

    const classNamesDiff = computeArrayDiff(
      a.classNames,
      b.classNames,
      (className) => className.value,
    );

    if (classNamesDiff.length) {
      currentItem.classNames = classNamesDiff;
    }

    const arrayDiff = computeArrayDiff(
      a.children,
      b.children,
      (item) => item.id,
    );

    if (arrayDiff.length > 0) {
      currentItem.children = mapArrayDiff(arrayDiff, unresolve);
    }
  }

  const items: NoyaDiffItem[] = isEmptyDiff(currentItem) ? [] : [currentItem];

  if (a.type === 'noyaPrimitiveElement' && b.type === 'noyaPrimitiveElement') {
    if (a.componentID !== b.componentID) {
      currentItem.componentID = b.componentID;
    }

    // Intersection of ids
    const aChildren = a.children.map((child) => child.id);
    const bChildren = b.children.map((child) => child.id);
    const intersection = aChildren.filter((id) => bChildren.includes(id));

    // Diff the intersection
    for (const id of intersection) {
      const aChild = a.children.find((child) => child.id === id);
      const bChild = b.children.find((child) => child.id === id);

      if (!aChild || !bChild) continue;

      items.push(...diffResolvedTrees(aChild, bChild).items);
    }
  } else if (
    a.type === 'noyaCompositeElement' &&
    b.type === 'noyaCompositeElement'
  ) {
    items.push(...diffResolvedTrees(a.rootElement, b.rootElement).items);
  }

  return Model.diff(items);
}

export function applyResolvedDiff(
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
              if (item.name !== undefined) {
                newNode.name = item.name;
              }

              if (item.componentID !== undefined) {
                newNode.componentID = item.componentID;
              }

              if (item.children) {
                newNode.children = applyArrayDiff(
                  newNode.children,
                  mapArrayDiff(item.children, (addedNode) =>
                    createResolvedNode(
                      findComponent,
                      addedNode,
                      [...path, ...item.path],
                      level,
                    ),
                  ),
                );
              }

              if (item.classNames) {
                newNode.classNames = applyArrayDiff(
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

export function instantiateResolvedComponent(
  findComponent: FindComponent,
  selection: SelectedComponent,
) {
  const instance = Model.compositeElement({
    id: 'root',
    componentID: selection.componentID,
    variantID: selection.variantID,
    diff: selection.diff,
  });

  let resolvedNode = createResolvedNode(findComponent, instance);

  ResolvedHierarchy.visit(resolvedNode, (node) => {
    // Remove the root prefix
    node.path = node.path.slice(1);
  });

  if (resolvedNode.type !== 'noyaCompositeElement') {
    throw new Error('Expected a composite element');
  }

  return resolvedNode.rootElement;
}
