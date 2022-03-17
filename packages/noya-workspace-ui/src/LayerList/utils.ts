import { visit } from 'tree-visit';

import Sketch from 'noya-file-format';
import { Selectors, PageLayer, Layers } from 'noya-state';
import type { LayerListItem } from './types';

export function flattenLayerList(
  page: Sketch.Page,
  selectedLayerIds: string[],
  filteredLayerIds: Set<string>,
): LayerListItem[] {
  const flattened: LayerListItem[] = [];

  visit<PageLayer | Sketch.Page>(page, {
    getChildren: (layer) => {
      if (layer.layerListExpandedType === Sketch.LayerListExpanded.Collapsed) {
        return [];
      }

      return Layers.getChildren(layer).slice().reverse();
    },
    onEnter(layer, indexPath) {
      if (Layers.isPageLayer(layer) || !filteredLayerIds.has(layer.do_objectID))
        return;

      const currentIndex = indexPath[indexPath.length - 1];

      const parent = Layers.accessReversed(
        page,
        indexPath.slice(0, -1),
      ) as Layers.ParentLayer;

      flattened.push({
        type:
          Layers.isShapePath(layer) && Selectors.isLine(layer.points)
            ? 'line'
            : layer._class,
        id: layer.do_objectID,
        name: layer.name,
        depth: indexPath.length - 1,
        expanded:
          layer.layerListExpandedType !== Sketch.LayerListExpanded.Collapsed,
        selected: selectedLayerIds.includes(layer.do_objectID),
        visible: layer.isVisible,
        hasClippingMask: layer.hasClippingMask ?? false,
        shouldBreakMaskChain: layer.shouldBreakMaskChain,
        isWithinMaskChain: Layers.isWithinMaskChain(parent, currentIndex),
        isLocked: layer.isLocked,
      });
    },
  });

  return flattened;
}
