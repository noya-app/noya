import { partitionDiff } from './partitionDiff';
import {
  FindComponent,
  instantiateResolvedComponent,
  unresolve,
} from './traversal';
import { NoyaComponent, NoyaNode, SelectedComponent } from './types';

export function applyDiff({
  selection,
  component,
  findComponent,
  enforceSchema,
}: {
  selection: SelectedComponent;
  component: NoyaComponent;
  findComponent: FindComponent;
  enforceSchema: (node: NoyaNode) => NoyaNode;
}): {
  selection: SelectedComponent;
  component: NoyaComponent;
} {
  const resolvedNode = instantiateResolvedComponent(findComponent, selection);

  if (!selection.diff) return { selection, component };

  if (selection.variantID) {
    // Merge the diff into the variant's diff
    const variant = component.variants?.find(
      (variant) => variant.id === selection.variantID,
    );

    if (!variant) return { selection, component };

    const newVariant = {
      ...variant,
      diff: {
        items: [...(variant.diff?.items ?? []), ...selection.diff.items],
      },
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
    unresolve(instance, { items: compositesDiff }),
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
