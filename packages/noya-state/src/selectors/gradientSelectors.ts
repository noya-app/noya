import Sketch from '@sketch-hq/sketch-file-format-ts';
import { getLinePercentage, Point } from 'noya-geometry';
import { PointString } from 'noya-sketch-model';
import {
  getCurrentPage,
  getLayerFlipTransform,
  getLayerTransformAtIndexPath,
  getLayerTranslationTransform,
  isPointInRange,
  Layers,
} from 'noya-state';
import { lerp } from 'noya-utils';
import {
  ApplicationState,
  SelectedGradient,
} from '../reducers/applicationReducer';
import { getLayerRotationTransform } from './transformSelectors';

export function getSelectedGradient(
  page: Sketch.Page,
  selectedGradient: SelectedGradient,
) {
  const { layerId, fillIndex } = selectedGradient;

  const layer = Layers.find(page, (layer) => layer.do_objectID === layerId);

  if (
    !layer ||
    layer.style?.fills?.[fillIndex].fillType !== Sketch.FillType.Gradient
  )
    return;

  return layer.style.fills[fillIndex].gradient;
}

type GradientStopPoint = { point: Point; color: Sketch.Color };

export function getSelectedGradientStopPoints(
  state: ApplicationState,
): GradientStopPoint[] | undefined {
  if (!state.selectedGradient) return;

  const { layerId, fillIndex } = state.selectedGradient;

  const page = getCurrentPage(state);
  const indexPath = Layers.findIndexPath(
    page,
    (layer) => layer.do_objectID === layerId,
  );

  if (!indexPath) return;

  const layer = Layers.access(page, indexPath);

  if (layer.style?.fills?.[fillIndex].fillType !== Sketch.FillType.Gradient)
    return;

  const transform = getLayerTransformAtIndexPath(page, indexPath)
    .transform(getLayerFlipTransform(layer))
    .transform(getLayerRotationTransform(layer))
    .transform(getLayerTranslationTransform(layer))
    .scale(layer.frame.width, layer.frame.height);

  const gradient = layer.style.fills[fillIndex].gradient;

  const from = PointString.decode(gradient.from);
  const to = PointString.decode(gradient.to);

  const extremePoints = {
    from: transform.applyTo(from),
    to: transform.applyTo(to),
  };

  return gradient.stops.map((stop) => {
    return {
      color: stop.color,
      point: {
        x: lerp(extremePoints.from.x, extremePoints.to.x, stop.position),
        y: lerp(extremePoints.from.y, extremePoints.to.y, stop.position),
      },
    };
  });
}

/**
 * This function normalizes a gradient so that gradient stop positions are
 * always between 0 and 1. The first position will be 0 and the last will be 1.
 * This function shouldn't change the gradient visually at all.
 *
 * We need to call this when we finish editing a gradient, or before dragging
 * a gradient stop on the canvas. It's OK if a gradient is temporarily in a state
 * where the stop positions aren't correct, since this is a better experience when
 * editing with the gradient picker.
 */
export function fixGradientPositions(gradient: Sketch.Gradient) {
  const stops = gradient.stops;

  const sorted = [...stops].sort((a, b) => a.position - b.position);

  const from = PointString.decode(gradient.from);
  const to = PointString.decode(gradient.to);

  const stopPoints = sorted.map(
    (stop): GradientStopPoint => ({
      point: {
        x: lerp(from.x, to.x, stop.position),
        y: lerp(from.y, to.y, stop.position),
      },
      color: stop.color,
    }),
  );

  const newFrom = stopPoints[0].point;
  const newTo = stopPoints[stopPoints.length - 1].point;

  gradient.from = PointString.encode(newFrom);
  gradient.to = PointString.encode(newTo);
  gradient.stops = stopPoints.map((stopPoint) => {
    return {
      _class: Sketch.ClassValue.GradientStop,
      color: stopPoint.color,
      position: getLinePercentage(stopPoint.point, [newFrom, newTo]),
    };
  });
}

export function getGradientStopIndexAtPoint(
  state: ApplicationState,
  point: Point,
): number {
  const selectedLayerGradientPoints = getSelectedGradientStopPoints(state);

  if (!selectedLayerGradientPoints) return -1;

  return selectedLayerGradientPoints.findIndex((gradientPoint) =>
    isPointInRange(gradientPoint.point, point),
  );
}

// function isPointOnLine(A: Point, B: Point, point: Point) {
//   // get distance from the point to the two ends of the line
//   const d1 = distance(point, A);
//   const d2 = distance(point, B);

//   const lineLen = distance(A, B);

//   const buffer = 5; // higher # = less accurate

//   return d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer;
// }

// export function getPercentageOfPointInGradient(
//   state: ApplicationState,
//   point: Point,
// ) {
//   const selectedLayerGradientPoints = getSelectedGradientStopPoints(state);

//   if (!selectedLayerGradientPoints) return 0;

//   // return getLinePercentage(
//   //   selectedLayerGradientPoints[0],
//   //   selectedLayerGradientPoints[selectedLayerGradientPoints.length - 1],
//   //   point,
//   // );

//   return 0;
// }

// export function isPointerOnGradientLine(state: ApplicationState, point: Point) {
//   if (getGradientStopIndexAtPoint(state, point) !== -1) return false;
//   const selectedLayerGradientPoints = getSelectedGradientStopPoints(state);

//   if (!selectedLayerGradientPoints) return false;

//   return isPointOnLine(
//     selectedLayerGradientPoints[0].point,
//     selectedLayerGradientPoints[selectedLayerGradientPoints.length - 1].point,
//     point,
//   );
// }
