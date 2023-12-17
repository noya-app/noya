import {
  NoyaDiffItem,
  NoyaResolvedNode,
  ResolvedHierarchy,
} from 'noya-component';
import { isDeepEqual, partition } from 'noya-utils';

/**
 * Partition diff into nodes that apply to a primitive element and nodes that apply
 * to a composite element. If a diff path is within a composite element, that should
 * be applied to the composite element, not the primitive element.
 */
export function partitionDiff(
  resolvedNode: NoyaResolvedNode,
  diffItems: NoyaDiffItem[],
): [primitives: NoyaDiffItem[], composites: NoyaDiffItem[]] {
  return partition(diffItems, (item) => {
    const indexPath = ResolvedHierarchy.findIndexPath(resolvedNode, (n) =>
      isDeepEqual(n.path, item.path),
    );

    if (!indexPath) return false;

    let nodePath = ResolvedHierarchy.accessPath(resolvedNode, indexPath);

    // Remove the root node which is the component itself
    // nodePath = nodePath.slice(1);

    const indexOfFirstComposite = nodePath.findIndex(
      (node) => node.type === 'noyaCompositeElement',
    );

    // If the path targets the component itself, it can be applied
    if (indexOfFirstComposite === nodePath.length - 1) return true;

    return indexOfFirstComposite === -1;
  });
}
