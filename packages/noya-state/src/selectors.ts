import type Sketch from '@sketch-hq/sketch-file-format-ts';
import type { CanvasKit } from 'canvaskit-wasm';
import {
  AffineTransform,
  rotatedRectContainsPoint,
  rectContainsPoint,
  getRectCornerPoints,
  createRectFromBounds,
  transformRect,
  createBounds,
  rectsIntersect,
} from 'noya-geometry';
import { getDragHandles } from 'noya-renderer/src/canvas/selection';
import * as Primitives from 'noya-renderer/src/primitives';
import { EnterReturnValue, IndexPath, SKIP, STOP } from 'tree-visit';
import { ApplicationState, Layers, PageLayer } from './index';
import { findIndexPath, INCLUDE_AND_SKIP, visitReversed } from './layers';
import { WorkspaceTab, ThemeTab } from './reducers/application';
import { CompassDirection } from './reducers/interaction';
import type { Point, Rect, UUID } from './types';

export const getCurrentPageIndex = (state: ApplicationState) => {
  const pageIndex = state.sketch.pages.findIndex(
    (page) => page.do_objectID === state.selectedPage,
  );

  if (pageIndex === -1) {
    throw new Error('A page must always be selected');
  }

  return pageIndex;
};

export const findPageLayerIndexPaths = (
  state: ApplicationState,
  predicate: (layer: Sketch.AnyLayer) => boolean,
): LayerIndexPaths[] => {
  return state.sketch.pages.map((page, pageIndex) => ({
    pageIndex: pageIndex,
    indexPaths: Layers.findAllIndexPaths(page, predicate),
  }));
};

export const getSharedSwatches = (state: ApplicationState): Sketch.Swatch[] => {
  return state.sketch.document.sharedSwatches?.objects ?? [];
};

export const getSharedStyles = (
  state: ApplicationState,
): Sketch.SharedStyle[] => {
  return state.sketch.document.layerStyles?.objects ?? [];
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

export const getCurrentComponentsTab = (state: ApplicationState): ThemeTab => {
  return state.currentThemeTab;
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

export const getSelectedStyles = (state: ApplicationState): Sketch.Style[] => {
  const currentTab = getCurrentTab(state);

  return currentTab === 'canvas'
    ? getSelectedLayers(state).flatMap((layer) =>
        layer.style ? [layer.style] : [],
      )
    : getSelectedLayerStyles(state).map((style) => style.value);
};

export const getSelectedLayers = (state: ApplicationState): PageLayer[] => {
  const page = getCurrentPage(state);

  return Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ) as PageLayer[];
};

export const getSelectedRect = (state: ApplicationState): Rect => {
  const page = getCurrentPage(state);
  const layerIndexPaths = getSelectedLayerIndexPaths(state);
  const layerIds = layerIndexPaths.map(
    (indexPath) => Layers.access(page, indexPath).do_objectID,
  );
  return getBoundingRect(page, AffineTransform.identity, layerIds)!;
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

export const getSelectedSwatches = (
  state: ApplicationState,
): Sketch.Swatch[] => {
  const sharedSwatches = getSharedSwatches(state);

  return sharedSwatches.filter((swatch) =>
    state.selectedSwatchIds.includes(swatch.do_objectID),
  );
};

export const getSelectedLayerStyles = (
  state: ApplicationState,
): Sketch.SharedStyle[] => {
  const sharedSwatches = getSharedStyles(state);

  return sharedSwatches.filter((swatch) =>
    state.selectedLayerStyleIds.includes(swatch.do_objectID),
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

export type LayerIndexPath = { pageIndex: number; indexPath: IndexPath };

export type LayerIndexPaths = { pageIndex: number; indexPaths: IndexPath[] };

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
  const boundingRect = getBoundingRect(
    page,
    AffineTransform.identity,
    state.selectedObjects,
  );

  if (!boundingRect) return;

  const handles = getDragHandles(boundingRect);

  const handle = handles.find((handle) =>
    rectContainsPoint(handle.rect, point),
  );

  return handle?.compassDirection;
}

export function getLayerFixedRadius(layer: Sketch.AnyLayer): number {
  return layer._class === 'rectangle' ? layer.fixedRadius : 0;
}

export type LayerTraversalOptions = {
  includeHiddenLayers: boolean;
  clickThroughGroups: boolean;
};

function shouldClickThrough(
  layer: Sketch.AnyLayer,
  options: LayerTraversalOptions,
) {
  return (
    layer._class === 'artboard' ||
    (layer._class === 'group' &&
      (layer.hasClickThrough || options.clickThroughGroups))
  );
}

function visitLayersReversed(
  rootLayer: Sketch.AnyLayer,
  ctm: AffineTransform,
  options: LayerTraversalOptions,
  onEnter: (layer: Sketch.AnyLayer, ctm: AffineTransform) => EnterReturnValue,
) {
  visitReversed(rootLayer, {
    onEnter: (layer, indexPath) => {
      if (layer._class === 'page') return;

      if (!layer.isVisible && !options.includeHiddenLayers) return SKIP;

      const transform = getLayerTransformAtIndexPathReversed(
        rootLayer,
        indexPath,
        ctm,
      );

      const result = onEnter(layer, transform);

      if (result === STOP) return result;

      if (!shouldClickThrough(layer, options)) return SKIP;

      return result;
    },
  });
}

export function getLayerAtPoint(
  CanvasKit: CanvasKit,
  state: ApplicationState,
  point: Point,
  traversalOptions?: LayerTraversalOptions,
): PageLayer | undefined {
  const page = getCurrentPage(state);
  const canvasTransform = getCanvasTransform(state);
  const screenTransform = getScreenTransform(state);

  const options = traversalOptions ?? {
    clickThroughGroups: false,
    includeHiddenLayers: false,
  };

  // TODO: check if we're clicking the title of an artboard

  let found: Sketch.AnyLayer | undefined;

  const screenPoint = screenTransform.applyTo(point);

  visitLayersReversed(page, canvasTransform, options, (layer, ctm) => {
    const transform = AffineTransform.multiply(
      ctm,
      getLayerRotationTransform(layer),
    );

    const framePoints = getRectCornerPoints(layer.frame);
    const localPoints = framePoints.map((point) => transform.applyTo(point));

    const containsPoint = rotatedRectContainsPoint(localPoints, screenPoint);

    if (!containsPoint) return SKIP;

    // Artboards can't be selected themselves, and instead only update the ctm
    if (shouldClickThrough(layer, options)) return;

    switch (layer._class) {
      case 'rectangle':
      case 'oval': {
        const pathPoint = transform.invert().applyTo(screenPoint);

        const path = Primitives.path(
          CanvasKit,
          layer.points,
          layer.frame,
          getLayerFixedRadius(layer),
        );

        if (!path.contains(pathPoint.x, pathPoint.y)) return;

        break;
      }
      default:
        break;
    }

    found = layer;

    return STOP;
  });

  return found as PageLayer;
}

export function getBoundingRect(
  rootLayer: Sketch.AnyLayer,
  ctm: AffineTransform,
  layerIds: string[],
  options?: LayerTraversalOptions,
): Rect | undefined {
  options = options ?? {
    clickThroughGroups: false,
    includeHiddenLayers: false,
  };

  let bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  visitLayersReversed(rootLayer, ctm, options, (layer, ctm) => {
    if (!layerIds.includes(layer.do_objectID)) return;

    const transform = AffineTransform.multiply(
      ctm,
      getLayerRotationTransform(layer),
    );

    const framePoints = getRectCornerPoints(layer.frame);
    const localPoints = framePoints.map((point) => transform.applyTo(point));

    const xs = localPoints.map((point) => point.x);
    const ys = localPoints.map((point) => point.y);

    bounds.minX = Math.min(bounds.minX, ...xs);
    bounds.minY = Math.min(bounds.minY, ...ys);
    bounds.maxX = Math.max(bounds.maxX, ...xs);
    bounds.maxY = Math.max(bounds.maxY, ...ys);
  });

  // Check that at least one layer had a non-zero size
  if (!Object.values(bounds).every(isFinite)) return undefined;

  return createRectFromBounds(bounds);
}

export function getBoundingPoints(
  rootLayer: Sketch.AnyLayer,
  ctm: AffineTransform,
  layerId: string,
  options?: LayerTraversalOptions,
): Point[] {
  options = options ?? {
    clickThroughGroups: false,
    includeHiddenLayers: false,
  };

  let points: Point[] = [];

  visitLayersReversed(rootLayer, ctm, options, (layer, ctm) => {
    if (layerId !== layer.do_objectID) return;

    const transform = AffineTransform.multiply(
      ctm,
      getLayerRotationTransform(layer),
    );

    const framePoints = getRectCornerPoints(layer.frame);
    points = framePoints.map((point) => transform.applyTo(point));

    return STOP;
  });

  return points;
}

export function getLayersInRect(
  CanvasKit: CanvasKit,
  state: ApplicationState,
  rect: Rect,
  traversalOptions?: LayerTraversalOptions,
): PageLayer[] {
  const options = traversalOptions ?? {
    clickThroughGroups: false,
    includeHiddenLayers: false,
  };

  const page = getCurrentPage(state);

  let found: Sketch.AnyLayer[] = [];

  const screenTransform = getScreenTransform(state);
  const screenRect = transformRect(rect, screenTransform);

  visitLayersReversed(
    page,
    getCanvasTransform(state),
    options,
    (layer, ctm) => {
      // TODO: Handle rotated rectangle collision
      const hasIntersect = rectsIntersect(
        transformRect(layer.frame, ctm),
        screenRect,
      );

      if (!hasIntersect) return SKIP;

      // Artboards can't be selected themselves
      if (shouldClickThrough(layer, options)) return;

      found.push(layer);
    },
  );

  return found as PageLayer[];
}

export function getLayerTransform(
  ctm: AffineTransform,
  layer: Sketch.AnyLayer,
): AffineTransform {
  const rotation = getLayerRotationTransform(layer);
  const translation = getLayerTranslationTransform(layer);

  return AffineTransform.multiply(ctm, rotation, translation);
}

export function getLayerTranslationTransform(
  layer: Sketch.AnyLayer,
): AffineTransform {
  return AffineTransform.translation(layer.frame.x, layer.frame.y);
}

export function getLayerRotationTransform(
  layer: Sketch.AnyLayer,
): AffineTransform {
  const bounds = createBounds(layer.frame);
  const midpoint = { x: bounds.midX, y: bounds.midY };
  const rotation = getLayerRotationRadians(layer);

  return AffineTransform.rotation(rotation, midpoint.x, midpoint.y);
}

export function getLayerTransformAtIndexPath(
  node: Sketch.AnyLayer,
  indexPath: IndexPath,
  ctm: AffineTransform,
): AffineTransform {
  const path = Layers.accessPath(node, indexPath).slice(1, -1);

  return path.reduce((result, layer) => getLayerTransform(result, layer), ctm);
}

export function getLayerTransformAtIndexPathReversed(
  node: Sketch.AnyLayer,
  indexPath: IndexPath,
  ctm: AffineTransform,
): AffineTransform {
  const path = Layers.accessPathReversed(node, indexPath).slice(1, -1);

  return path.reduce((result, layer) => getLayerTransform(result, layer), ctm);
}

export function getLayerRotationMultiplier(layer: Sketch.AnyLayer): number {
  return layer._class === 'group' ? -1 : 1;
}

export function getLayerRotation(layer: Sketch.AnyLayer): number {
  return layer.rotation * getLayerRotationMultiplier(layer);
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function getLayerRotationRadians(layer: Sketch.AnyLayer): number {
  return toRadians(getLayerRotation(layer));
}

export function getScreenTransform(state: ApplicationState) {
  return AffineTransform.translation(state.canvasInsets.left, 0);
}

export function getCanvasTransform(state: ApplicationState) {
  const { scrollOrigin, zoomValue } = getCurrentPageMetadata(state);

  return AffineTransform.multiply(
    getScreenTransform(state),
    AffineTransform.translation(scrollOrigin.x, scrollOrigin.y),
    AffineTransform.scale(zoomValue),
  );
}

export function visitColors(
  style: Sketch.Style,
  f: (color: Sketch.Color) => void,
): void {
  style?.fills?.forEach((fill) => f(fill.color));
  style?.borders?.forEach((border) => f(border.color));
  style?.shadows?.forEach((shadow) => f(shadow.color));
  style?.innerShadows.forEach((fill) => f(fill.color));
}
