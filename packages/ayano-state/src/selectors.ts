import type { CanvasKit } from 'canvaskit-wasm';
import * as Primitives from 'sketch-canvas/src/primitives';
import type { ApplicationState, PageLayer, Point } from './index';

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

export const getCurrentPageMetadata = (state: ApplicationState) => {
  const currentPage = getCurrentPage(state);

  const meta: { scrollOrigin: string; zoomValue: number } =
    state.sketch.user[currentPage.do_objectID];

  return {
    zoomValue: meta.zoomValue,
    scrollOrigin: Primitives.parsePoint(meta.scrollOrigin),
  };
};

export const getSelectedLayerIndexes = (state: ApplicationState): number[] => {
  const page = getCurrentPage(state);

  return state.selectedObjects
    .map((id) => page.layers.findIndex((layer) => layer.do_objectID === id))
    .filter((index) => index !== -1);
};

export const getSelectedLayers = (state: ApplicationState): PageLayer[] => {
  const page = getCurrentPage(state);

  return state.selectedObjects
    .map((id) => page.layers.find((layer) => layer.do_objectID === id))
    .filter((layer): layer is PageLayer => !!layer);
};

export function getLayerAtPoint(
  CanvasKit: CanvasKit,
  state: ApplicationState,
  point: Point,
): PageLayer | undefined {
  const page = getCurrentPage(state);

  const layers = page.layers.filter((layer) => {
    const rect = layer.frame;

    return (
      rect.x <= point.x &&
      point.x <= rect.x + rect.width &&
      rect.y <= point.y &&
      point.y <= rect.y + rect.height
    );
  });

  return [...layers.reverse()].find((layer) => {
    // TODO: Check path
    if (layer._class === 'oval') {
      const path = Primitives.path(CanvasKit, layer.points, layer.frame);
      return path.contains(point.x, point.y);
    }

    return true;
  });
}
