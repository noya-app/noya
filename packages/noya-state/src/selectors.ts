import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  getBoundingRect,
  getDragHandles,
} from 'noya-renderer/src/canvas/selection';
import * as Primitives from 'noya-renderer/src/primitives';
import type { CanvasKit } from 'canvaskit-wasm';
import { IndexPath, SKIP, STOP } from 'tree-visit';
import { ApplicationState, Layers, PageLayer } from './index';
import { findIndexPath, INCLUDE_AND_SKIP, visitReversed } from './layers';
import { CompassDirection } from './reducers/interaction';
import type { Point, Rect, UUID } from './types';
import { AffineTransform } from './utils/AffineTransform';
import { WorkspaceTab } from './reducers/application';
import { EnterReturnValue } from 'tree-visit';
import { uuid } from 'noya-renderer';

export const getCurrentPageIndex = (state: ApplicationState) => {
  const pageIndex = state.sketch.pages.findIndex(
    (page) => page.do_objectID === state.selectedPage,
  );

  if (pageIndex === -1) {
    throw new Error('A page must always be selected');
  }

  return pageIndex;
};
export const getSharedSwatches = (
  state: ApplicationState
): Sketch.Swatch[] => {
  return (
    state.sketch.document.sharedSwatches?.objects ?? []
  );
};

export const getCurrentPage = (state: ApplicationState) => {
  return state.sketch.pages[getCurrentPageIndex(state)];
};

export type EncodedPageMetadata = {
  zoomValue: number;
  scrollOrigin: string;
};

export type PageMetadata = {
  zoomValue: number;
  scrollOrigin: Point;
};

export const getCurrentTab = (state: ApplicationState): WorkspaceTab => {
  return state.currentTab;
};

export const getCurrentPageMetadata = (
  state: ApplicationState,
): PageMetadata => {
  const currentPage = getCurrentPage(state);

  const meta: EncodedPageMetadata = state.sketch.user[currentPage.do_objectID];

  return {
    zoomValue: meta.zoomValue,
    scrollOrigin: Primitives.parsePoint(meta.scrollOrigin),
  };
};

export const getSelectedLayerIndexPaths = (
  state: ApplicationState,
): IndexPath[] => {
  const page = getCurrentPage(state);

  return Layers.findAllIndexPaths(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  );
};

export const getSelectedLayerIndexPathsExcludingDescendants = (
  state: ApplicationState,
): IndexPath[] => {
  const page = getCurrentPage(state);

  return Layers.findAllIndexPaths<Sketch.AnyLayer>(page, (layer) => {
    const included = state.selectedObjects.includes(layer.do_objectID);

    if (included && layer._class === 'artboard') {
      return INCLUDE_AND_SKIP;
    }

    return included;
  });
};

export const getSelectedLayersExcludingDescendants = (
  state: ApplicationState,
): Sketch.AnyLayer[] => {
  const pageIndex = getCurrentPageIndex(state);

  return getSelectedLayerIndexPathsExcludingDescendants(state).map(
    (layerIndex) => {
      return Layers.access(state.sketch.pages[pageIndex], layerIndex);
    },
  );
};

export const getSelectedLayers = (state: ApplicationState): PageLayer[] => {
  const page = getCurrentPage(state);

  return Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ) as PageLayer[];
};

export const getSelectedLayersWithContextSettings = (
  state: ApplicationState,
): PageLayer[] => {
  const page = getCurrentPage(state);

  return (Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ) as PageLayer[]).filter(
    (layer) => layer._class !== 'artboard' && layer.style?.contextSettings,
  );
};

export const getSelectedLayersWithFixedRadius = (
  state: ApplicationState,
): Sketch.Rectangle[] => {
  const page = getCurrentPage(state);

  return Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ).filter((layer): layer is Sketch.Rectangle => layer._class === 'rectangle');
};

export const getSelectedColorSwatches = (
  state: ApplicationState,
): Sketch.Swatch[] => {
  const sharedSwatches = getSharedSwatches(state);

  return sharedSwatches.filter((swatch) =>
      state.selectedSwatchIds.includes(swatch.do_objectID),
    );
};

export const makeGetPageLayers = (
  state: ApplicationState,
): ((ids: UUID[]) => PageLayer[]) => {
  const page = getCurrentPage(state);

  return (ids: UUID[]) =>
    ids
      .map((id) => page.layers.find((layer) => layer.do_objectID === id))
      .filter((layer): layer is PageLayer => !!layer);
};

export type LayerIndexPath = { pageIndex: number; indexPath: number[] };

export const getLayerIndexPath = (
  state: ApplicationState,
  id: UUID,
): LayerIndexPath | undefined => {
  const page = getCurrentPage(state);
  const pageIndex = getCurrentPageIndex(state);
  const indexPath = findIndexPath(page, (layer) => layer.do_objectID === id);

  return indexPath ? { pageIndex, indexPath } : undefined;
};

export function getScaleDirectionAtPoint(
  state: ApplicationState,
  point: Point,
): CompassDirection | undefined {
  const page = getCurrentPage(state);
  const boundingRect = getBoundingRect(page, state.selectedObjects);

  if (!boundingRect) return;

  const handles = getDragHandles(boundingRect);

  const handle = handles.find((handle) =>
    Primitives.rectContainsPoint(handle.rect, point),
  );

  return handle?.compassDirection;
}

export function getLayerFixedRadius(layer: Sketch.AnyLayer): number {
  return layer._class === 'rectangle' ? layer.fixedRadius : 0;
}

function shouldClickThrough(
  layer: Sketch.AnyLayer,
  options?: { clickThroughGroups: boolean },
) {
  return (
    layer._class === 'artboard' ||
    (layer._class === 'group' &&
      (layer.hasClickThrough || options?.clickThroughGroups))
  );
}

/**
 * This function visits each layer while keeping track of the
 * "current transformation matrix" (ctm).
 *
 * How this works: Every time we enter or exit an artboard/group,
 * we need to keep track of the translation for that layer. For the
 * artboard/group layers themselves, we want to run the `onEnter` callback
 * before we transform the ctm, since that transformation should only
 * apply to their children.
 */
function visitWithCurrentTransform(
  layer: Sketch.AnyLayer,
  options: {
    clickThroughGroups: boolean;
    onEnter: (
      layer: Sketch.AnyLayer,
      indexPath: IndexPath,
      ctm: AffineTransform,
    ) => EnterReturnValue;
  },
) {
  let ctm = AffineTransform.identity;

  // TODO: do we need to keep track of zoom/rotation too?
  visitReversed(layer, {
    onEnter: (layer, indexPath) => {
      if (layer._class === 'page') return;

      if (shouldClickThrough(layer, options)) {
        const result = options?.onEnter?.(layer, indexPath, ctm);

        // Don't apply the transformation if we're going to skip children
        if (result === SKIP || result === STOP) return result;

        ctm = ctm.transform(
          AffineTransform.translation(-layer.frame.x, -layer.frame.y),
        );

        return result;
      }

      return options?.onEnter?.(layer, indexPath, ctm);
    },
    onLeave: (layer) => {
      if (shouldClickThrough(layer, options)) {
        ctm = ctm.transform(
          AffineTransform.translation(layer.frame.x, layer.frame.y),
        );
      }
    },
  });
}

export function getLayerAtPoint(
  CanvasKit: CanvasKit,
  state: ApplicationState,
  point: Point,
  options?: { clickThroughGroups: boolean },
): PageLayer | undefined {
  const page = getCurrentPage(state);

  // TODO: check if we're clicking the title of an artboard

  let found: Sketch.AnyLayer | undefined;

  visitWithCurrentTransform(page, {
    clickThroughGroups: options?.clickThroughGroups ?? false,
    onEnter: (layer, _, ctm) => {
      if (layer._class === 'page') return;

      const localPoint = ctm.applyTo(point);
      const containsPoint = Primitives.rectContainsPoint(
        layer.frame,
        localPoint,
      );

      if (!containsPoint) return SKIP;

      // Artboards can't be selected themselves, and instead only update the ctm
      if (shouldClickThrough(layer, options)) return;

      switch (layer._class) {
        case 'rectangle':
        case 'oval': {
          const path = Primitives.path(
            CanvasKit,
            layer.points,
            layer.frame,
            getLayerFixedRadius(layer),
          );

          if (!path.contains(localPoint.x, localPoint.y)) return;

          break;
        }
        default:
          break;
      }

      found = layer;

      return STOP;
    },
  });

  return found as PageLayer;
}

export function getLayersInRect(
  CanvasKit: CanvasKit,
  state: ApplicationState,
  rect: Rect,
  options?: { clickThroughGroups: boolean },
): PageLayer[] {
  const page = getCurrentPage(state);

  let found: Sketch.AnyLayer[] = [];

  visitWithCurrentTransform(page, {
    clickThroughGroups: options?.clickThroughGroups ?? false,
    onEnter: (layer, _, ctm) => {
      if (layer._class === 'page') return;

      let hasIntersect = Primitives.rectsIntersect(
        layer.frame,
        Primitives.transformRect(rect, ctm),
      );

      if (!hasIntersect) return SKIP;

      // Artboards can't be selected themselves, and instead only update the ctm
      if (shouldClickThrough(layer, options)) return;

      found.push(layer);
    },
  });

  return found as PageLayer[];
}
