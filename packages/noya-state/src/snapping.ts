import Sketch from '@sketch-hq/sketch-file-format-ts';
import { AffineTransform, Bounds, createBounds } from 'noya-geometry';
import { Axis } from 'noya-renderer/src/components/guides';
import { isDeepEqual } from 'noya-utils';
import { IndexPath } from 'tree-visit';
import { Layers } from '.';
import { ParentLayer } from './layers';
import { ApplicationState } from './reducers/applicationReducer';
import { InteractionState } from './reducers/interactionReducer';
import { getLayersInRect } from './selectors/geometrySelectors';
import { getBoundingRect, getCurrentPage } from './selectors/selectors';

export function getAxisValues(
  rectBounds: Bounds,
  axis: Axis,
): [number, number, number] {
  if (axis === 'x') {
    // return [rectBounds.minX] as any;
    return [rectBounds.minX, rectBounds.midX, rectBounds.maxX];
  } else {
    // return [] as any;
    return [rectBounds.minY, rectBounds.midY, rectBounds.maxY];
  }
}

export function getPossibleSnapLayers(
  selectedIndexPaths: IndexPath[],
  state: ApplicationState,
  interactionState: Extract<InteractionState, { type: 'moving' }>,
) {
  const { canvasSize } = interactionState;

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

  // Step 1: Are all selected ids in the same artboard?
  const inSameArtboard =
    Layers.isSymbolMasterOrArtboard(page.layers[selectedIndexPaths[0][0]]) &&
    selectedIndexPaths.every((indexPath) => indexPath.length > 1) &&
    selectedIndexPaths.every(
      (indexPath) => indexPath[0] === selectedIndexPaths[0][0],
    );

  // Step 2: Do all selected ids have the same parent?
  const sharedParentIndex = selectedIndexPaths[0].slice(0, -1);
  const inSameParent = selectedIndexPaths.every((indexPath) =>
    isDeepEqual(indexPath.slice(0, -1), sharedParentIndex),
  );

  // console.log('same artboard', inSameArtboard);
  // console.log('same parent', inSameParent);

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

export function getLayerAxisPairs(
  page: Sketch.Page,
  layers: Sketch.AnyLayer[],
): SelectedValueObj[] {
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

    const bounds = createBounds(rect);

    return [
      {
        layerId: layer.do_objectID,
        y: getAxisValues(bounds, 'y'),
        x: getAxisValues(bounds, 'x'),
      },
    ];
  });
}

export function findSmallestSnappingDistance(values: CombinationValue[]) {
  const getDelta = (pair: CombinationValue) =>
    pair.selectedLayerValue - pair.visibleLayerValue;

  const getDistance = (pair: CombinationValue) => Math.abs(getDelta(pair));

  const distances = values
    .filter((pair) => getDistance(pair) <= 6)
    .sort((a, b) => getDistance(a) - getDistance(b));

  return distances.length > 0 ? getDelta(distances[0]) : 0;
}

type SelectedValueObj = {
  layerId: string;
  y: [number, number, number];
  x: [number, number, number];
};

export type BoundsObj = {
  selectedLayerValues: [number, number, number];
  visibleLayerValues: [number, number, number];
  visibleLayerId: string;
};

export type CombinationValue = {
  selectedLayerValue: number;
  visibleLayerValue: number;
  visibleLayerId: string;
};

export function allCombinations(obj: BoundsObj) {
  let combos: CombinationValue[] = [];
  obj.selectedLayerValues.forEach((selectedLayerValue) => {
    obj.visibleLayerValues.forEach((visibleLayerValue) => {
      combos.push({
        selectedLayerValue: selectedLayerValue,
        visibleLayerValue: visibleLayerValue,
        visibleLayerId: obj.visibleLayerId,
      });
    });
  });
  return combos;
}

export function getVisibleAndSelectedLayerAxisPairs(
  selectedAxisValues: [number, number, number],
  visibleLayersAxisValues: SelectedValueObj[],
  axis: Axis,
) {
  return visibleLayersAxisValues.flatMap((visibleLayer) =>
    allCombinations({
      visibleLayerValues: visibleLayer[axis],
      selectedLayerValues: selectedAxisValues,
      visibleLayerId: visibleLayer.layerId,
    }),
  );
}
