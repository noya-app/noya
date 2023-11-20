import cloneDeep from 'lodash/cloneDeep';
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
  applyArrayDiff,
  computeArrayDiff,
  mapArrayDiff,
} from 'noya-component';
import { RelativeDropPosition } from 'noya-designsystem';
import { isDeepEqual } from 'noya-utils';
import { defineTree } from 'tree-visit';
import { Model } from './builders';
import { ResolvedHierarchy } from './resolvedHierarchy';

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

export function unresolve(
  resolvedNode: NoyaResolvedNode,
  diffParam: NoyaDiff = { items: [] },
): NoyaNode {
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
      const { id, name, type, componentID, diff, variantNames } = resolvedNode;

      const node: NoyaCompositeElement = {
        id,
        name,
        type,
        componentID,
        variantNames,
        diff:
          diffParam.items.length > 0
            ? {
                ...diff,
                items: [
                  ...(diff?.items ?? []),
                  ...diffParam.items.map((item) => ({
                    ...item,
                    path: item.path.slice(1),
                  })),
                ],
              }
            : diff,
      };

      return node;
    }
    case 'noyaPrimitiveElement': {
      const { id, name, classNames, props, children, componentID, type } =
        resolvedNode;

      const nestedDiffItems = diffParam.items
        .filter((item) => item.path[0] === id)
        .map((item) => ({ ...item, path: item.path.slice(1) }));

      const node: NoyaPrimitiveElement = {
        id,
        name,
        type,
        componentID,
        props,
        classNames,
        children: children.map((child) =>
          unresolve(child, {
            items: nestedDiffItems.filter((item) => item.path[0] === child.id),
          }),
        ),
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
    !diff.props &&
    !diff.classNames &&
    !diff.variantNames &&
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

    const propsDiff = computeArrayDiff(a.props, b.props, (item) =>
      JSON.stringify(item),
    );

    if (propsDiff.length > 0) {
      currentItem.props = propsDiff;
    }
  } else if (
    a.type === 'noyaCompositeElement' &&
    b.type === 'noyaCompositeElement'
  ) {
    // Diff variantNames
    const variantNamesDiff = computeArrayDiff(
      a.variantNames ?? [],
      b.variantNames ?? [],
      (item) => item.id,
    );

    if (variantNamesDiff.length > 0) {
      currentItem.variantNames = variantNamesDiff;
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

          diff.items
            .filter((item) => {
              const itemKey = [...path, ...item.path].join('/');
              return itemKey === nodeKey;
            })
            .forEach((item) => {
              if (item.name !== undefined) {
                newNode.name = item.name;
              }

              if (item.variantNames) {
                newNode.variantNames = applyArrayDiff(
                  newNode.variantNames ?? [],
                  item.variantNames,
                );
              }
            });

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
                    createResolvedNode(findComponent, addedNode, [
                      ...path,
                      ...item.path,
                    ]),
                  ),
                );
              }

              if (item.props) {
                newNode.props = applyArrayDiff(newNode.props, item.props);
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
): NoyaResolvedNode {
  const path = [...parentPath, node.id];

  switch (node.type) {
    case 'noyaString':
      return { ...node, path };
    case 'noyaPrimitiveElement': {
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
      );

      const variantDiffItems = node.diff?.items.flatMap((item) =>
        isDeepEqual(item.path, path) ? item.variantNames ?? [] : [],
      );

      const variantNames = applyArrayDiff(
        node.variantNames ?? [],
        variantDiffItems ?? [],
      );

      for (let variantName of variantNames) {
        const variant = component.variants?.find(
          (variant) => variant.id === variantName.variantID,
        );

        if (!variant) {
          console.info(
            `Failed to resolve variant ${variantName.variantID} for component ${component.name}`,
          );
        }

        if (variant) {
          resolvedNode = applyResolvedDiff(
            findComponent,
            resolvedNode,
            variant.diff,
            path,
          );
        }
      }

      if (node.diff) {
        resolvedNode = applyResolvedDiff(
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
  }
}

export function instantiateResolvedComponent(
  findComponent: FindComponent,
  selection: SelectedComponent,
) {
  const instance = Model.compositeElement({
    id: 'root',
    componentID: selection.componentID,
    ...(selection.variantID && {
      variantNames: [Model.variantName(selection.variantID)],
    }),
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
