import Sketch from '@sketch-hq/sketch-file-format-ts';
import type { CanvasKit } from 'canvaskit';
import {
  AffineTransform,
  createRectFromBounds,
  getRectCornerPoints,
  Insets,
  Point,
  Rect,
  rectContainsPoint,
  rectsIntersect,
  rotatedRectContainsPoint,
  transformRect,
} from 'noya-geometry';
import * as Primitives from 'noya-state';
import { getRectDragHandles } from 'noya-state';
import { SKIP, STOP, VisitOptions } from 'tree-visit';
import { ApplicationState, Layers, PageLayer } from '../index';
import { visitReversed } from '../layers';
import { CompassDirection } from '../reducers/interactionReducer';
import { getSelectedLayerIndexPaths } from './indexPathSelectors';
import { getCurrentPage } from './pageSelectors';
import {
  getCanvasTransform,
  getLayerFlipTransform,
  getLayerRotationTransform,
  getLayerTransformAtIndexPathReversed,
  getScreenTransform,
} from './transformSelectors';

export type LayerTraversalOptions = {
  /**
   * The default is false
   */
  includeHiddenLayers?: boolean;

  /**
   * The default is `groupOnly`
   */
  groups?: 'groupOnly' | 'childrenOnly';

  /**
   * The default is `childrenOnly`
   */
  artboards?: 'artboardOnly' | 'childrenOnly' | 'artboardAndChildren';
};

const DEFAULT_TRAVERSAL_OPTIONS: Required<LayerTraversalOptions> = {
  includeHiddenLayers: false,
  groups: 'groupOnly',
  artboards: 'childrenOnly',
};

function shouldVisitChildren(
  layer: Sketch.AnyLayer,
  traversalOptions: LayerTraversalOptions,
) {
  const options: Required<LayerTraversalOptions> = {
    ...DEFAULT_TRAVERSAL_OPTIONS,
    ...traversalOptions,
  };

  switch (layer._class) {
    case 'symbolMaster':
      return true;
    case 'artboard':
      return options.artboards !== 'artboardOnly';
    case 'group':
      return options.groups !== 'groupOnly' || layer.hasClickThrough;
    case 'slice':
      return options.groups !== 'groupOnly';
    default:
      return false;
  }
}

function shouldVisitLayer(
  layer: Sketch.AnyLayer,
  traversalOptions: LayerTraversalOptions,
) {
  const options: Required<LayerTraversalOptions> = {
    ...DEFAULT_TRAVERSAL_OPTIONS,
    ...traversalOptions,
  };

  return layer.isVisible || options.includeHiddenLayers;
}

function visitLayersReversed(
  rootLayer: Sketch.AnyLayer,
  options: LayerTraversalOptions,
  onEnter: NonNullable<VisitOptions<Sketch.AnyLayer>['onEnter']>,
) {
  visitReversed(rootLayer, {
    onEnter: (layer, indexPath) => {
      if (Layers.isPageLayer(layer)) return;

      if (!shouldVisitLayer(layer, options)) return SKIP;

      const result = onEnter(layer, indexPath);

      if (result === STOP) return result;

      if (!shouldVisitChildren(layer, options)) return SKIP;

      return result;
    },
  });
}

export function getLayersInRect(
  state: ApplicationState,
  page: Sketch.Page,
  insets: Insets,
  rect: Rect,
  options: LayerTraversalOptions = {},
): PageLayer[] {
  let found: Sketch.AnyLayer[] = [];

  const screenTransform = getScreenTransform(insets);
  const screenRect = transformRect(rect, screenTransform);

  const canvasTransform = getCanvasTransform(state, insets);

  visitLayersReversed(page, options, (layer, indexPath) => {
    const transform = getLayerTransformAtIndexPathReversed(
      page,
      indexPath,
      canvasTransform,
    );

    // TODO: Handle rotated rectangle collision
    const hasIntersect = rectsIntersect(
      transformRect(layer.frame, transform),
      screenRect,
    );

    if (!hasIntersect) return SKIP;

    const includeArtboard =
      Layers.isArtboard(layer) && options.artboards === 'artboardAndChildren';

    // Artboards can't be selected themselves, unless we enable that option
    if (!includeArtboard && shouldVisitChildren(layer, options)) return;

    found.push(layer);
  });

  return found as PageLayer[];
}

export function getLayerAtPoint(
  CanvasKit: CanvasKit,
  state: ApplicationState,
  insets: Insets,
  point: Point,
  options: LayerTraversalOptions = {},
): PageLayer | undefined {
  const page = getCurrentPage(state);
  const canvasTransform = getCanvasTransform(state, insets);
  const screenTransform = getScreenTransform(insets);

  // TODO: check if we're clicking the title of an artboard

  let found: Sketch.AnyLayer | undefined;

  const screenPoint = screenTransform.applyTo(point);

  visitLayersReversed(page, options, (layer, indexPath) => {
    const transform = AffineTransform.multiply(
      getLayerTransformAtIndexPathReversed(page, indexPath, canvasTransform),
      getLayerFlipTransform(layer),
      getLayerRotationTransform(layer),
    );

    const framePoints = getRectCornerPoints(layer.frame);
    const localPoints = framePoints.map((point) => transform.applyTo(point));

    const containsPoint = rotatedRectContainsPoint(localPoints, screenPoint);

    if (!containsPoint) return SKIP;

    // Artboards can't be selected themselves, and instead only update the ctm
    if (shouldVisitChildren(layer, options)) return;

    switch (layer._class) {
      case 'rectangle':
      case 'oval': {
        const pathPoint = transform.invert().applyTo(screenPoint);

        const path = Primitives.path(
          CanvasKit,
          layer.points,
          layer.frame,
          layer.isClosed,
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

/**
 * Returns an axis-aligned Rect that contains all layers passed via `layerIds`,
 * or undefined if no layers were passed.
 */
export function getBoundingRect(
  rootLayer: Sketch.AnyLayer,
  layerIds: string[],
  options: LayerTraversalOptions = {},
): Rect | undefined {
  let bounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  };

  visitLayersReversed(rootLayer, options, (layer, indexPath) => {
    if (!layerIds.includes(layer.do_objectID)) return;

    const transform = AffineTransform.multiply(
      getLayerTransformAtIndexPathReversed(rootLayer, indexPath),
      getLayerFlipTransform(layer),
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
  layerId: string,
  options: LayerTraversalOptions = {},
): Point[] {
  let points: Point[] = [];

  visitLayersReversed(rootLayer, options, (layer, indexPath) => {
    if (layerId !== layer.do_objectID) return;

    const transform = AffineTransform.multiply(
      getLayerTransformAtIndexPathReversed(rootLayer, indexPath),
      getLayerFlipTransform(layer),
      getLayerRotationTransform(layer),
    );

    const framePoints = getRectCornerPoints(layer.frame);
    points = framePoints.map((point) => transform.applyTo(point));

    return STOP;
  });

  return points;
}

export function getScaleDirectionAtPoint(
  state: ApplicationState,
  point: Point,
): CompassDirection | undefined {
  const page = getCurrentPage(state);
  const boundingRect = getBoundingRect(page, state.selectedObjects);

  if (!boundingRect) return;

  const handles = getRectDragHandles(boundingRect);

  const handle = handles.find((handle) =>
    rectContainsPoint(handle.rect, point),
  );

  return handle?.compassDirection;
}

export const getSelectedRect = (state: ApplicationState): Rect => {
  const page = getCurrentPage(state);
  const layerIndexPaths = getSelectedLayerIndexPaths(state);
  const layerIds = layerIndexPaths.map(
    (indexPath) => Layers.access(page, indexPath).do_objectID,
  );
  return getBoundingRect(page, layerIds)!;
};

export function getBoundingRectMap(
  rootLayer: Sketch.AnyLayer,
  layerIds: string[],
  options: LayerTraversalOptions,
) {
  const rectMap: Record<string, Rect> = {};

  layerIds.forEach((layerId) => {
    if (layerId in rectMap) return;

    const rect = getBoundingRect(rootLayer, [layerId], options);

    if (!rect) return;

    rectMap[layerId] = rect;
  });

  return rectMap;
}

export function getPageContentBoundingRect(page: Sketch.Page) {
  return getBoundingRect(
    page,
    Layers.findAll(page, () => true).map((l) => l.do_objectID),
  );
}
