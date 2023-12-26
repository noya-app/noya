import { applyArrayDiff } from './arrayDiff';
import { Model } from './builders';
import { partitionDiff } from './partitionDiff';
import {
  ElementHierarchy,
  FindComponent,
  createSelectionWithDiff,
  instantiateResolvedComponent,
  unresolve,
} from './traversal';
import { NoyaComponent, NoyaDiff, NoyaNode, SelectedComponent } from './types';

export function applySelectionDiff({
  selection,
  component,
  findComponent,
  enforceSchema,
  enforceSchemaInDiff,
  debug,
}: {
  selection: SelectedComponent;
  component: NoyaComponent;
  findComponent: FindComponent;
  enforceSchema: (node: NoyaNode) => NoyaNode;
  enforceSchemaInDiff: (diff: NoyaDiff) => NoyaDiff;
  debug?: boolean;
}): {
  selection: SelectedComponent;
  component: NoyaComponent;
} {
  const resolvedNode = instantiateResolvedComponent(findComponent, selection);

  if (!selection.diff && !selection.metaDiff) return { selection, component };

  if (selection.metaDiff) {
    const unresolved = unresolve(resolvedNode);

    const newRoot = ElementHierarchy.map<NoyaNode>(
      unresolved,
      (node, transformedChildren) => {
        if (node.type === 'noyaString') return node;

        if (node.type === 'noyaPrimitiveElement') {
          return { ...node, children: transformedChildren };
        }

        const metaDiffItems = selection.metaDiff?.[node.id];

        if (!metaDiffItems || !node.diff?.items) return node;

        const newDiffItems = applyArrayDiff(node.diff.items, metaDiffItems);

        return { ...node, diff: Model.diff(newDiffItems) };
      },
    );

    return {
      component: {
        ...component,
        rootElement: enforceSchema(newRoot),
      },
      selection: {
        ...selection,
        metaDiff: undefined,
      },
    };
  }

  if (selection.variantID) {
    const variant = component.variants?.find(
      (variant) => variant.id === selection.variantID,
    );

    if (!variant) return { selection, component };

    // Create a variant diff by taking the diff between the base node and current (variant) node
    const { diff: mergedDiff } = createSelectionWithDiff({
      selection: { componentID: selection.componentID },
      findComponent,
      newResolvedNode: resolvedNode,
      debug,
    });

    const newVariant = {
      ...variant,
      ...(mergedDiff && {
        diff: enforceSchemaInDiff(mergedDiff),
      }),
    };

    return {
      component: {
        ...component,
        variants: component.variants?.map((variant) =>
          variant.id === selection.variantID ? newVariant : variant,
        ),
      },
      selection: {
        ...selection,
        diff: undefined,
      },
    };
  }

  const [primitivesDiff, compositesDiff] = partitionDiff(
    resolvedNode,
    selection.diff?.items || [],
  );

  const instance = instantiateResolvedComponent(findComponent, {
    componentID: selection.componentID,
    variantID: selection.variantID,
    diff: { items: primitivesDiff },
  });

  const unresolved = unresolve(instance, { items: compositesDiff }, debug);

  const newRootElement = enforceSchema(unresolved);

  return {
    component: {
      ...component,
      rootElement: newRootElement,
    },
    selection: {
      ...selection,
      diff: undefined,
      metaDiff: undefined,
    },
  };
}
