import Sketch from '@sketch-hq/sketch-file-format-ts';
import { AffineTransform, Axis, createBounds, Rect, Size } from 'noya-geometry';
import { isDeepEqual } from 'noya-utils';
import { IndexPath } from 'tree-visit';
import { Layers } from '.';
import { ParentLayer } from './layers';
import { ApplicationState } from './reducers/applicationReducer';
import { getLayersInRect } from './selectors/geometrySelectors';
import { getBoundingRect, getCurrentPage } from './selectors/selectors';

export function getAxisValues(
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

export function getLayerAxisInfo(
  page: Sketch.Page,
  layers: Sketch.AnyLayer[],
): SnappingLayerInfo[] {
  return layers.flatMap((layer) => {
    const rect = getBoundingRect(
      page,
      AffineTransform.identity,
      [layer.do_objectID],
      {
        clickThroughGroups: true,
        includeHiddenLayers: false,
        includeArtboardLayers: false,
      },
    );

    if (!rect) return [];

    return [
      {
        layerId: layer.do_objectID,
        y: getAxisValues(rect, 'y'),
        x: getAxisValues(rect, 'x'),
      },
    ];
  });
}

export function findSmallestSnappingDistance(values: SnappingPair[]) {
  const getDelta = (pair: SnappingPair) =>
    pair.selectedLayerValue - pair.visibleLayerValue;

  const getDistance = (pair: SnappingPair) => Math.abs(getDelta(pair));

  const distances = values
    .filter((pair) => getDistance(pair) <= 6)
    .sort((a, b) => getDistance(a) - getDistance(b));

  return distances.length > 0 ? getDelta(distances[0]) : 0;
}

type SnappingLayerInfo = {
  layerId: string;
  y: [number, number, number];
  x: [number, number, number];
};

export type SnappingPair = {
  selectedLayerValue: number;
  visibleLayerValue: number;
  visibleLayerId: string;
};

export function getSnappingPairs(
  selectedAxisValues: [number, number, number],
  visibleLayersAxisValues: SnappingLayerInfo[],
  axis: Axis,
): SnappingPair[] {
  return visibleLayersAxisValues.flatMap((axisValues) =>
    selectedAxisValues.flatMap((selectedLayerValue) =>
      axisValues[axis].map((visibleLayerValue) => ({
        selectedLayerValue: selectedLayerValue,
        visibleLayerValue: visibleLayerValue,
        visibleLayerId: axisValues.layerId,
      })),
    ),
  );
}
