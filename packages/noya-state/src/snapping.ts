import Sketch from 'noya-file-format';
import {
  Axis,
  createBounds,
  createRect,
  Point,
  Rect,
  Size,
} from 'noya-geometry';
import { cartesianProduct, isDeepEqual } from 'noya-utils';
import { IndexPath } from 'tree-visit';
import { Layers } from './layer';
import { ParentLayer } from './layers';
import { resizeRect, ScalingOptions } from './primitives';
import type { ApplicationState } from './reducers/applicationReducer';
import { CompassDirection } from './reducers/interactionReducer';
import { getRectExtentPoint } from './selection';
import {
  getBoundingRect,
  getLayersInRect,
} from './selectors/geometrySelectors';
import { getSelectedLayerIndexPathsExcludingDescendants } from './selectors/indexPathSelectors';
import { getCurrentPageMetadata } from './selectors/pageSelectors';

export function getSnapValues(rect: Rect, axis: Axis): number[] {
  const bounds = createBounds(rect);

  const values =
    axis === 'x'
      ? [bounds.minX, bounds.midX, bounds.maxX]
      : [bounds.minY, bounds.midY, bounds.maxY];

  // If the values are close enough, don't snap to the midpoint as a separate value
  if (values[2] - values[0] <= 1) {
    return [values[0], values[2]];
  } else {
    return values;
  }
}

// If we're snapping a layer that's currently being drawn, but hasn't
// been added to the document, the `sourceIndexPaths` will be empty.
export function getPossibleTargetSnapLayers(
  state: ApplicationState,
  page: Sketch.Page,
  canvasSize: Size,
  sourceIndexPaths: IndexPath[] = [],
) {
  // Ensure we don't snap to a selected layer by filtering them out
  const sourceIds = sourceIndexPaths.map(
    (indexPath) => Layers.access(page, indexPath).do_objectID,
  );

  const allVisibleLayers = getLayersInRect(
    state,
    page,
    { left: 0, right: 0, top: 0, bottom: 0 },
    { x: 0, y: 0, width: canvasSize.width, height: canvasSize.height },
    {
      artboards:
        sourceIndexPaths.length === 0 ? 'artboardAndChildren' : 'artboardOnly',
    },
  );

  // If we're not snapping a source layer (i.e. a layer with a parent) then
  // we can snap anywhere in the hierarchy
  if (sourceIndexPaths.length === 0) {
    return allVisibleLayers.filter(
      (layer) => !sourceIds.includes(layer.do_objectID),
    );
  }

  // Are all selected ids in the same artboard?
  //
  // We get the first layer in the layer path of the first selected layer.
  // We check if that layer is an artboard, and if every other index path also
  // has that same layer as the first in its layer path
  const inSameArtboard =
    Layers.isSymbolMasterOrArtboard(page.layers[sourceIndexPaths[0][0]]) &&
    sourceIndexPaths.every((indexPath) => indexPath.length > 1) &&
    sourceIndexPaths.every(
      (indexPath) => indexPath[0] === sourceIndexPaths[0][0],
    );

  // Do all selected ids have the same parent?
  const sharedParentIndex = sourceIndexPaths[0].slice(0, -1);
  const inSameParent = sourceIndexPaths.every((indexPath) =>
    isDeepEqual(indexPath.slice(0, -1), sharedParentIndex),
  );

  // TODO: Make sure these layers are visible
  let groupLayers: Sketch.AnyLayer[] = [];

  if (inSameArtboard) {
    const artboard = page.layers[sourceIndexPaths[0][0]] as Sketch.Artboard;

    groupLayers.push(artboard);

    if (!inSameParent) {
      groupLayers.push(...artboard.layers);
    }
  }

  if (inSameParent) {
    const parent = Layers.access(
      page,
      sourceIndexPaths[0].slice(0, -1),
    ) as ParentLayer;

    groupLayers.push(...parent.layers);
  }

  // If the only selection is a single artboard, we allow snapping to layers within the artboard.
  // This is useful for scaling an artboard to fit the contents within.
  if (sourceIndexPaths.length === 1) {
    const firstLayer = page.layers[sourceIndexPaths[0][0]];

    if (Layers.isArtboard(firstLayer)) {
      groupLayers.push(...firstLayer.layers);
    }
  }

  const visibleLayers =
    inSameArtboard || inSameParent ? groupLayers : allVisibleLayers;

  return visibleLayers.filter(
    (layer) => !sourceIds.includes(layer.do_objectID),
  );
}

export function getLayerSnapValues(
  page: Sketch.Page,
  layerId: string,
  axis: Axis,
): number[] {
  const rect = getBoundingRect(page, [layerId], { groups: 'childrenOnly' });

  return rect ? getSnapValues(rect, axis) : [];
}

const BASE_SNAP_DISTANCE = 6;

function getSnapDistance(zoomValue: number) {
  return BASE_SNAP_DISTANCE / zoomValue;
}

export function getSnapAdjustmentDistance(values: Snap[], zoomValue: number) {
  const getDelta = (snap: Snap) => snap.source - snap.target;

  const getDistance = (snap: Snap) => Math.abs(getDelta(snap));

  const distances = values
    .filter((snap) => getDistance(snap) <= getSnapDistance(zoomValue))
    .sort((a, b) => getDistance(a) - getDistance(b));

  return distances.length > 0 ? getDelta(distances[0]) : 0;
}

export type Snap = {
  source: number;
  target: number;
  targetId: string;
};

export function getSnaps(
  sourceValues: number[],
  targetValues: number[],
  targetId: string,
): Snap[] {
  return cartesianProduct(sourceValues, targetValues).map(
    ([source, target]) => ({ source, target, targetId }),
  );
}

export function getSnapAdjustmentForVisibleLayers(
  state: ApplicationState,
  page: Sketch.Page,
  canvasSize: Size,
  sourceRect: Rect,
  sourceIndexPaths?: IndexPath[],
): Point {
  const targetLayers = getPossibleTargetSnapLayers(
    state,
    page,
    canvasSize,
    sourceIndexPaths,
  );

  const sourceXs = getSnapValues(sourceRect, 'x');
  const sourceYs = getSnapValues(sourceRect, 'y');

  const xSnaps = targetLayers.flatMap((targetLayer) =>
    getSnaps(
      sourceXs,
      getLayerSnapValues(page, targetLayer.do_objectID, 'x'),
      targetLayer.do_objectID,
    ),
  );
  const ySnaps = targetLayers.flatMap((targetLayer) =>
    getSnaps(
      sourceYs,
      getLayerSnapValues(page, targetLayer.do_objectID, 'y'),
      targetLayer.do_objectID,
    ),
  );
  const { zoomValue } = getCurrentPageMetadata(state);

  return {
    x: getSnapAdjustmentDistance(xSnaps, zoomValue),
    y: getSnapAdjustmentDistance(ySnaps, zoomValue),
  };
}

export function getScaledSnapBoundingRect(
  state: ApplicationState,
  page: Sketch.Page,
  boundingRect: Rect,
  delta: Point,
  canvasSize: Size,
  direction: CompassDirection,
  scalingOptions: ScalingOptions,
): Rect {
  const newBoundingRectBeforeSnap = resizeRect(
    boundingRect,
    delta,
    direction,
    scalingOptions,
  );

  const extentPoint = getRectExtentPoint(newBoundingRectBeforeSnap, direction);

  const snapAdjustment = getSnapAdjustmentForVisibleLayers(
    state,
    page,
    canvasSize,
    createRect(extentPoint, extentPoint),
    getSelectedLayerIndexPathsExcludingDescendants(state),
  );

  return resizeRect(
    boundingRect,
    {
      x: delta.x - snapAdjustment.x,
      y: delta.y - snapAdjustment.y,
    },
    direction,
    scalingOptions,
  );
}
