import { partitionDiff } from './partitionDiff';
import {
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

  if (!selection.diff) return { selection, component };

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
    selection.diff.items || [],
  );

  const instance = instantiateResolvedComponent(findComponent, {
    componentID: selection.componentID,
    variantID: selection.variantID,
    diff: { items: primitivesDiff },
  });

  const newRootElement = enforceSchema(
    unresolve(instance, { items: compositesDiff }, debug),
  );

  return {
    component: {
      ...component,
      rootElement: newRootElement,
    },
    selection: {
      ...selection,
      diff: undefined,
    },
  };
}
