import Sketch from '@sketch-hq/sketch-file-format-ts';
import { AffineTransform, Axis, createBounds, Rect, Size } from 'noya-geometry';
import { isDeepEqual } from 'noya-utils';
import { IndexPath } from 'tree-visit';
import { Layers } from '.';
import { ParentLayer } from './layers';
import { ApplicationState } from './reducers/applicationReducer';
import { getLayersInRect } from './selectors/geometrySelectors';
import { getBoundingRect, getCurrentPage } from './selectors/selectors';

export function getSnapValues(
  rect: Rect,
  axis: Axis,
): [number, number, number] {
  const bounds = createBounds(rect);

  if (axis === 'x') {
    return [bounds.minX, bounds.midX, bounds.maxX];
  } else {
    return [bounds.minY, bounds.midY, bounds.maxY];
  }
}

export function getPossibleSnapLayers(
  state: ApplicationState,
  selectedIndexPaths: IndexPath[],
  canvasSize: Size,
) {
  const page = getCurrentPage(state);

  const allVisibleLayers = getLayersInRect(
    state,
    { left: 0, right: 0 },
    { x: 0, y: 0, width: canvasSize.width, height: canvasSize.height },
    {
      clickThroughGroups: false,
      includeHiddenLayers: false,
      includeArtboardLayers: true,
    },
  );

  // Are all selected ids in the same artboard?
  const inSameArtboard =
    Layers.isSymbolMasterOrArtboard(page.layers[selectedIndexPaths[0][0]]) &&
    selectedIndexPaths.every((indexPath) => indexPath.length > 1) &&
    selectedIndexPaths.every(
      (indexPath) => indexPath[0] === selectedIndexPaths[0][0],
    );

  // Do all selected ids have the same parent?
  const sharedParentIndex = selectedIndexPaths[0].slice(0, -1);
  const inSameParent = selectedIndexPaths.every((indexPath) =>
    isDeepEqual(indexPath.slice(0, -1), sharedParentIndex),
  );

  // TODO: Make sure these layers are visible
  let groupLayers: Sketch.AnyLayer[] = [];

  if (inSameArtboard) {
    const artboard = page.layers[selectedIndexPaths[0][0]] as Sketch.Artboard;

    groupLayers.push(artboard);

    if (!inSameParent) {
      groupLayers.push(...artboard.layers);
    }
  }

  if (inSameParent) {
    const parent = Layers.access(
      page,
      selectedIndexPaths[0].slice(0, -1),
    ) as ParentLayer;

    groupLayers.push(...parent.layers);
  }

  const visibleLayers =
    inSameArtboard || inSameParent ? groupLayers : allVisibleLayers;

  return visibleLayers;
}

export function getLayerSnapValues(
  page: Sketch.Page,
  layerId: string,
  axis: Axis,
): number[] {
  const rect = getBoundingRect(page, AffineTransform.identity, [layerId], {
    clickThroughGroups: true,
    includeHiddenLayers: false,
    includeArtboardLayers: false,
  });

  return rect ? getSnapValues(rect, axis) : [];
}

export function getLayerSnappingInfo(
  page: Sketch.Page,
  layerId: string,
): SnappingLayerInfo {
  return {
    layerId,
    x: getLayerSnapValues(page, layerId, 'x'),
    y: getLayerSnapValues(page, layerId, 'y'),
  };
}

export function getSnapAdjustmentDistance(values: PossibleSnap[]) {
  const getDelta = (pair: PossibleSnap) => pair.source - pair.target;

  const getDistance = (pair: PossibleSnap) => Math.abs(getDelta(pair));

  const distances = values
    .filter((pair) => getDistance(pair) <= 6)
    .sort((a, b) => getDistance(a) - getDistance(b));

  return distances.length > 0 ? getDelta(distances[0]) : 0;
}

type SnappingLayerInfo = {
  layerId: string;
  y: number[];
  x: number[];
};

export type PossibleSnap = {
  source: number;
  target: number;
  targetId: string;
};

export function getSnappingPairs(
  sourceValues: number[],
  targetValues: number[],
  targetId: string,
): PossibleSnap[] {
  return sourceValues.flatMap((source) =>
    targetValues.map((target) => ({
      source,
      target,
      targetId,
    })),
  );
}
