import { isDeepEqual } from '@noya-app/noya-utils';
import {
  Model,
  NoyaComponent,
  NoyaCompositeElement,
  NoyaDiff,
  NoyaDiffItem,
  NoyaNode,
  NoyaPrimitiveElement,
  NoyaResolvedNode,
  NoyaResolvedPrimitiveElement,
  NoyaString,
  ResolvedHierarchy,
  SelectedComponent,
  applyArrayDiff,
  computeArrayDiff,
  mapArrayDiff,
  resolvedNodeReducer,
} from 'noya-component';
import { defineTree } from 'tree-visit';

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
  create: (node: NoyaNode, children: NoyaNode[]) => {
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

export function unresolve(
  resolvedNode: NoyaResolvedNode,
  diffParam: NoyaDiff = { items: [] },
  debug = false,
): NoyaNode {
  for (const item of diffParam.items) {
    if (isDeepEqual(item.path, resolvedNode.path)) {
      if (item.newRootNode) {
        return item.newRootNode;
      }
    }
  }

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
                  ...diffParam.items
                    .filter((item) =>
                      isDeepEqual(
                        item.path.slice(0, resolvedNode.path.length),
                        resolvedNode.path,
                      ),
                    )
                    .map((item) => ({
                      ...item,
                      path: item.path.slice(resolvedNode.path.length),
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

      const nestedDiffItems = diffParam.items.filter((item) =>
        item.path.join('/').startsWith(resolvedNode.path.join('/')),
      );

      const node: NoyaPrimitiveElement = {
        id,
        name,
        type,
        componentID,
        props,
        classNames,
        children: children.map((child) =>
          unresolve(child, { items: nestedDiffItems }, debug),
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
    !diff.children &&
    !diff.newRootNode
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
      { removalMode: 'key' },
    );

    if (classNamesDiff.length) {
      currentItem.classNames = classNamesDiff;
    }

    const arrayDiff = computeArrayDiff(
      a.children,
      b.children,
      (item) => item.id,
      { removalMode: 'key' },
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
      { removalMode: 'key' },
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

export function applyResolvedDiff({
  findComponent,
  rootNode,
  diff,
  parentPath,
  debug = false,
}: {
  findComponent: FindComponent;
  rootNode: NoyaResolvedNode;
  diff: NoyaDiff;
  parentPath: string[];
  debug?: boolean;
}) {
  for (const item of diff.items) {
    const path = [...parentPath, ...item.path];
    const node = ResolvedHierarchy.findByPath(rootNode, path);

    if (!node) continue;

    const indexPath = ResolvedHierarchy.indexPathOfNode(rootNode, node);

    if (!indexPath) {
      throw new Error(
        `Failed to find index path of node: ${node.name ?? node.id}`,
      );
    }

    if (item.newRootNode) {
      rootNode = createResolvedNode({
        findComponent,
        node: item.newRootNode,
        parentPath: item.path,
        debug,
      });

      continue;
    }

    if (item.name !== undefined) {
      rootNode = resolvedNodeReducer(rootNode, {
        type: 'setName',
        indexPath,
        name: item.name,
      });
    }

    if (item.textValue !== undefined) {
      rootNode = resolvedNodeReducer(rootNode, {
        type: 'setTextValue',
        indexPath,
        textValue: item.textValue,
      });
    }

    if (item.componentID !== undefined) {
      rootNode = resolvedNodeReducer(rootNode, {
        type: 'setComponentID',
        indexPath,
        componentID: item.componentID,
      });
    }

    if (item.props && node.type === 'noyaPrimitiveElement') {
      rootNode = resolvedNodeReducer(rootNode, {
        type: 'setProps',
        indexPath,
        props: applyArrayDiff(node.props, item.props, (item) => item.id),
      });
    }

    if (item.classNames && node.type === 'noyaPrimitiveElement') {
      rootNode = resolvedNodeReducer(rootNode, {
        type: 'setClassNames',
        indexPath,
        classNames: applyArrayDiff(
          node.classNames,
          item.classNames,
          (item) => item.id,
        ),
      });
    }

    if (item.variantNames && node.type === 'noyaCompositeElement') {
      // TODO: Need to actually apply the variant diff, but maybe not here.
      // If a variant name is added we could apply it here, but how would we
      // apply a removed variant name?
      rootNode = resolvedNodeReducer(rootNode, {
        type: 'setVariantNames',
        indexPath,
        variantNames: applyArrayDiff(
          node.variantNames ?? [],
          item.variantNames,
          (item) => item.id,
        ),
      });
    }

    if (item.children && node.type === 'noyaPrimitiveElement') {
      rootNode = resolvedNodeReducer(rootNode, {
        type: 'setChildren',
        indexPath,
        children: applyArrayDiff(
          node.children,
          mapArrayDiff(item.children, (addedNode) => {
            const result = createResolvedNode({
              findComponent,
              node: addedNode,
              parentPath: [...parentPath, ...item.path],
              debug,
            });

            return result;
          }),
          (item) => item.id,
        ),
      });
    }
  }

  return rootNode;
}

export function createResolvedNode({
  findComponent,
  node,
  parentPath = [],
  debug = false,
}: {
  findComponent: FindComponent;
  node: NoyaNode;
  parentPath?: string[];
  debug?: boolean;
}): NoyaResolvedNode {
  const path = [...parentPath, node.id];

  switch (node.type) {
    case 'noyaString':
      return { ...node, path };
    case 'noyaPrimitiveElement': {
      const children = node.children.map<NoyaResolvedNode>((child) =>
        createResolvedNode({
          findComponent,
          node: child,
          parentPath: path,
          debug,
        }),
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

      let resolvedNode = createResolvedNode({
        findComponent,
        node: component.rootElement,
        parentPath: path,
        debug,
      });

      const variantDiffItems = node.diff?.items.flatMap((item) =>
        isDeepEqual(item.path, path) ? item.variantNames ?? [] : [],
      );

      const variantNames = applyArrayDiff(
        node.variantNames ?? [],
        variantDiffItems ?? [],
        (item) => item.id,
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
          resolvedNode = applyResolvedDiff({
            findComponent,
            rootNode: resolvedNode,
            diff: variant.diff,
            parentPath: path,
            debug,
          });
        }
      }

      if (node.diff) {
        resolvedNode = applyResolvedDiff({
          findComponent,
          rootNode: resolvedNode,
          diff: node.diff,
          parentPath: path,
          debug,
        });
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
  debug = false,
) {
  const instance = Model.compositeElement({
    id: 'root',
    componentID: selection.componentID,
    ...(selection.variantID && {
      variantNames: [Model.variantName(selection.variantID)],
    }),
    diff: selection.diff,
  });

  let resolvedNode = createResolvedNode({
    findComponent,
    node: instance,
    parentPath: [],
    debug,
  });

  ResolvedHierarchy.visit(resolvedNode, (node) => {
    // Remove the root prefix
    node.path = node.path.slice(1);
  });

  if (resolvedNode.type !== 'noyaCompositeElement') {
    throw new Error('Expected a composite element');
  }

  return resolvedNode.rootElement;
}

export function createSelectionWithDiff({
  selection,
  newResolvedNode,
  findComponent,
  debug,
}: {
  selection: SelectedComponent;
  newResolvedNode: NoyaResolvedNode;
  findComponent: FindComponent;
  debug?: boolean;
}): SelectedComponent {
  const instance = instantiateResolvedComponent(findComponent, {
    componentID: selection.componentID,
    variantID: selection.variantID,
  });

  if (instance.id !== newResolvedNode.id) {
    return {
      ...selection,
      diff: Model.diff([
        Model.diffItem({
          path: [instance.id],
          newRootNode: newResolvedNode,
        }),
      ]),
    };
  } else {
    const diff = diffResolvedTrees(instance, newResolvedNode);

    return { ...selection, diff };
  }
}
