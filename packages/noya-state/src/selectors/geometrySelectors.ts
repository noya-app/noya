import Sketch from '@sketch-hq/sketch-file-format-ts';
import type { CanvasKit } from 'canvaskit';
import {
  AffineTransform,
  createRectFromBounds,
  getRectCornerPoints,
  rectContainsPoint,
  rectsIntersect,
  rotatedRectContainsPoint,
  transformRect,
} from 'noya-geometry';
import { PointString } from 'noya-sketch-model';
import * as Primitives from 'noya-state';
import { getDragHandles } from 'noya-state';
import { lerp } from 'noya-utils';
import { EnterReturnValue, SKIP, STOP } from 'tree-visit';
import { ApplicationState, Layers, PageLayer } from '../index';
import { visitReversed } from '../layers';
import { CompassDirection } from '../reducers/interactionReducer';
import { CanvasInsets } from '../reducers/workspaceReducer';
import type { Point, Rect } from '../types';
import { getSelectedLayerIndexPaths } from './indexPathSelectors';
import { getCurrentPage } from './pageSelectors';
import {
  getCanvasTransform,
  getLayerRotationTransform,
  getLayerTransformAtIndexPathReversed,
  getScreenTransform,
} from './transformSelectors';

export type LayerTraversalOptions = {
  includeHiddenLayers: boolean;
  clickThroughGroups: boolean;
  includeArtboardLayers: boolean;
};

function shouldClickThrough(
  layer: Sketch.AnyLayer,
  options: LayerTraversalOptions,
) {
  return (
    layer._class === 'symbolMaster' ||
    (layer._class === 'artboard' && !options.includeArtboardLayers) ||
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
      if (Layers.isPageLayer(layer)) return;

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

export function getLayersInRect(
  state: ApplicationState,
  insets: CanvasInsets,
  rect: Rect,
  traversalOptions?: LayerTraversalOptions,
): PageLayer[] {
  const options = traversalOptions ?? {
    clickThroughGroups: false,
    includeHiddenLayers: false,
    includeArtboardLayers: false,
  };

  const page = getCurrentPage(state);

  let found: Sketch.AnyLayer[] = [];

  const screenTransform = getScreenTransform(insets);
  const screenRect = transformRect(rect, screenTransform);

  visitLayersReversed(
    page,
    getCanvasTransform(state, insets),
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

export function getLayerAtPoint(
  CanvasKit: CanvasKit,
  state: ApplicationState,
  insets: CanvasInsets,
  point: Point,
  traversalOptions?: LayerTraversalOptions,
): PageLayer | undefined {
  const page = getCurrentPage(state);
  const canvasTransform = getCanvasTransform(state, insets);
  const screenTransform = getScreenTransform(insets);

  const options = traversalOptions ?? {
    clickThroughGroups: false,
    includeHiddenLayers: false,
    includeArtboardLayers: false,
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
  ctm: AffineTransform,
  layerIds: string[],
  options?: LayerTraversalOptions,
): Rect | undefined {
  options = options ?? {
    clickThroughGroups: false,
    includeHiddenLayers: false,
    includeArtboardLayers: false,
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
    includeArtboardLayers: false,
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

export const getSelectedRect = (state: ApplicationState): Rect => {
  const page = getCurrentPage(state);
  const layerIndexPaths = getSelectedLayerIndexPaths(state);
  const layerIds = layerIndexPaths.map(
    (indexPath) => Layers.access(page, indexPath).do_objectID,
  );
  return getBoundingRect(page, AffineTransform.identity, layerIds)!;
};

export function getBoundingRectMap(
  rootLayer: Sketch.AnyLayer,
  layerIds: string[],
  options: LayerTraversalOptions,
) {
  const rectMap: Record<string, Rect> = {};

  layerIds.forEach((layerId) => {
    if (layerId in rectMap) return;

    const rect = getBoundingRect(
      rootLayer,
      AffineTransform.identity,
      [layerId],
      options,
    );

    if (!rect) return;

    rectMap[layerId] = rect;
  });

  return rectMap;
}

export function getFirstSelectedLayerGradientPoints(
  state: ApplicationState,
): { point: Point; color: Sketch.Color }[] | undefined {
  if (!state.selectedGradient) return;

  const { layerId, fillIndex } = state.selectedGradient;

  const page = getCurrentPage(state);
  const layer = Layers.find(page, (layer) => layer.do_objectID === layerId);
  const boundingRect = getBoundingRect(
    page,
    AffineTransform.identity,
    [layerId],
    {
      clickThroughGroups: true,
      includeArtboardLayers: false,
      includeHiddenLayers: false,
    },
  );

  if (
    !boundingRect ||
    !layer ||
    !layer.style ||
    !layer.style.fills ||
    !layer.style.fills[fillIndex] ||
    layer.style.fills[fillIndex].fillType !== Sketch.FillType.Gradient
  )
    return;

  const gradient = layer.style.fills[fillIndex].gradient;

  const from = PointString.decode(gradient.from);
  const to = PointString.decode(gradient.to);

  const extremePoints = {
    from: {
      x: boundingRect.width * from.x + boundingRect.x,
      y: boundingRect.height * from.y + boundingRect.y,
    },
    to: {
      x: boundingRect.width * to.x + boundingRect.x,
      y: boundingRect.height * to.y + boundingRect.y,
    },
  };

  const sortedGradients = [...gradient.stops].sort(
    (a, b) => a.position - b.position,
  );

  return [...gradient.stops].map((stop, index) => {
    switch (index) {
      case 0:
        return {
          color: stop.color,
          point: extremePoints.from,
        };
      case sortedGradients.length - 1:
        return {
          color: stop.color,
          point: extremePoints.to,
        };
      default:
        return {
          color: stop.color,
          point: {
            x: lerp(extremePoints.from.x, extremePoints.to.x, stop.position),
            y: lerp(extremePoints.from.y, extremePoints.to.y, stop.position),
          },
        };
    }
  });
}

export function pointerOnGradientPoint(state: ApplicationState, point: Point) {
  const selectedLayerGradientPoints = getFirstSelectedLayerGradientPoints(
    state,
  );

  if (!selectedLayerGradientPoints) return -1;

  // return selectedLayerGradientPoints.findIndex((gradientPoint) =>
  //   isPointInRange(gradientPoint, point),
  // );

  return -1;
}

// function isPointOnLine(A: Point, B: Point, point: Point) {
//   // get distance from the point to the two ends of the line
//   const d1 = distance(point, A);
//   const d2 = distance(point, B);

//   const lineLen = distance(A, B);

//   const buffer = 5; // higher # = less accurate

//   return d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer;
// }

// function getLinePercentage(A: Point, B: Point, point: Point) {
//   const d1 = distance(point, A);
//   const d2 = distance(point, B);

//   const buffer = 0.2;

//   //calculate the percentage of the line that the point is on
//   return (d1 + buffer) / (d1 + d2 + 2 * buffer);
// }

export function getPercentageOfPointInGradient(
  state: ApplicationState,
  point: Point,
) {
  const selectedLayerGradientPoints = getFirstSelectedLayerGradientPoints(
    state,
  );

  if (!selectedLayerGradientPoints) return 0;

  // return getLinePercentage(
  //   selectedLayerGradientPoints[0],
  //   selectedLayerGradientPoints[selectedLayerGradientPoints.length - 1],
  //   point,
  // );

  return 0;
}

export function isPointerOnGradientLine(state: ApplicationState, point: Point) {
  if (pointerOnGradientPoint(state, point) !== -1) return false;
  const selectedLayerGradientPoints = getFirstSelectedLayerGradientPoints(
    state,
  );

  if (!selectedLayerGradientPoints) return false;

  // return isPointOnLine(
  //   selectedLayerGradientPoints[0],
  //   selectedLayerGradientPoints[selectedLayerGradientPoints.length - 1],
  //   point,
  // );

  return false;
}
