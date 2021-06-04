import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  AffineTransform,
  Bounds,
  createBounds,
  createRect,
} from 'noya-geometry';
import { Axis } from 'noya-renderer/src/components/guides';
import { getLayersInRect } from './selectors/geometrySelectors';
import { getBoundingRect, getCurrentPage } from './selectors/selectors';
import { ApplicationState } from './reducers/applicationReducer';
import { InteractionState } from './reducers/interactionReducer';

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

export function getVisibleLayersAxisValues(
  selectedLayerIds: string[],
  state: ApplicationState,
  interactionState: Extract<InteractionState, { type: 'moving' }>,
) {
  const { canvasSize } = interactionState;

  const page = getCurrentPage(state);

  const allVisibleLayers = getLayersInRect(
    state,
    {
      left: 0,
      right: 0,
    },
    createRect({ x: canvasSize.width, y: 0 }, { x: 0, y: canvasSize.height }),
    {
      clickThroughGroups: false,
      includeHiddenLayers: false,
      includeArtboardLayers: true,
    },
  );
  let isLayerInGroup = false;
  let groupLayers: Sketch.AnyLayer[] = [];

  allVisibleLayers
    .filter(
      (layer): layer is Sketch.Group | Sketch.Artboard =>
        layer._class === 'artboard' || layer._class === 'group',
    )
    .forEach((group) => {
      if (group.layers.length === 0) {
        return;
      }

      const result = group.layers.filter(
        (groupLayer) => groupLayer.do_objectID === selectedLayerIds[0],
      );

      if (result.length > 0) {
        isLayerInGroup = true;
        group.layers.forEach((layer) => {
          groupLayers.push(layer);
        });
        groupLayers.push(group);
      }
    });

  const values: SelectedValueObj[] = [];
  const layers = isLayerInGroup ? groupLayers : allVisibleLayers;

  layers.forEach(function (visibleLayer) {
    const rect = getBoundingRect(
      page,
      AffineTransform.identity,
      [visibleLayer.do_objectID],
      {
        clickThroughGroups: true,
        includeHiddenLayers: true,
        includeArtboardLayers: false,
      },
    );
    if (rect) {
      const rectBounds = createBounds(rect);
      values.push({
        layerId: visibleLayer.do_objectID,
        y: getAxisValues(rectBounds, 'y'),
        x: getAxisValues(rectBounds, 'x'),
      });
    }
  });
  return values;
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
