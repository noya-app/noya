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
import type { Point, UUID } from './types';

export const getCurrentPageIndex = (state: ApplicationState) => {
  const pageIndex = state.sketch.pages.findIndex(
    (page) => page.do_objectID === state.selectedPage,
  );

  if (pageIndex === -1) {
    throw new Error('A page must always be selected');
  }

  return pageIndex;
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

export function getLayerAtPoint(
  CanvasKit: CanvasKit,
  state: ApplicationState,
  point: Point,
  options?: { clickThroughGroups: boolean },
): PageLayer | undefined {
  const page = getCurrentPage(state);

  // TODO: check if we're clicking the title of an artboard

  // TODO: need to keep track of zoom also
  let translate: Point = { x: 0, y: 0 };
  let found: Sketch.AnyLayer | undefined;

  visitReversed(page, {
    onEnter: (layer) => {
      if (layer._class === 'page') return;

      const localPoint = { x: point.x + translate.x, y: point.y + translate.y };

      let containsPoint = Primitives.rectContainsPoint(layer.frame, localPoint);

      if (!containsPoint) return SKIP;

      // Artboards can't be selected themselves, and instead only update the ctm
      if (
        layer._class === 'artboard' ||
        (layer._class === 'group' &&
          (layer.hasClickThrough || options?.clickThroughGroups))
      ) {
        translate.x -= layer.frame.x;
        translate.y -= layer.frame.y;

        return;
      }

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
    onLeave: (layer) => {
      if (layer._class === 'artboard') {
        translate.x += layer.frame.x;
        translate.y += layer.frame.y;
        return;
      }
    },
  });

  return found as PageLayer;
}
