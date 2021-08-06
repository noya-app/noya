import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  AffineTransform,
  distance,
  getLinePercentage,
  isPointInLine,
  Point,
} from 'noya-geometry';
import { PointString } from 'noya-sketch-model';
import {
  getCurrentPage,
  getLayerTransformAtIndexPath,
  isPointInRange,
  Layers,
} from 'noya-state';
import { lerp } from 'noya-utils';
import {
  ApplicationState,
  SelectedGradient,
} from '../reducers/applicationReducer';
import { SELECTED_GRADIENT_POINT_RADIUS } from './pointSelectors';

export function getSelectedGradient(
  page: Sketch.Page,
  selectedGradient: SelectedGradient,
) {
  const { layerId, fillIndex, styleType } = selectedGradient;

  const layer = Layers.find(page, (layer) => layer.do_objectID === layerId);

  if (
    !layer ||
    layer.style?.[styleType]?.[fillIndex].fillType !== Sketch.FillType.Gradient
  )
    return;

  const gradient = layer.style?.[styleType]?.[fillIndex].gradient;

  if (!gradient) return;
  return gradient;
}

type GradientStopPoint = { point: Point; color: Sketch.Color };

export function getSelectedGradientStopPoints(
  state: ApplicationState,
  sorted = false,
): GradientStopPoint[] | undefined {
  if (!state.selectedGradient) return;

  const { layerId, fillIndex, styleType } = state.selectedGradient;
  const page = getCurrentPage(state);
  const indexPath = Layers.findIndexPath(
    page,
    (layer) => layer.do_objectID === layerId,
  );

  if (!indexPath) return;

  const layer = Layers.access(page, indexPath);

  if (
    layer.style?.[styleType]?.[fillIndex]?.fillType !== Sketch.FillType.Gradient
  )
    return;

  const transform = getLayerTransformAtIndexPath(
    page,
    indexPath,
    AffineTransform.identity,
    'includeLast',
  ).scale(layer.frame.width, layer.frame.height);

  const gradient = layer.style?.[styleType]?.[fillIndex].gradient;

  if (!gradient) return;

  const from = PointString.decode(gradient.from);
  const to = PointString.decode(gradient.to);

  const extremePoints = {
    from: transform.applyTo(from),
    to: transform.applyTo(to),
  };

  const stops = sorted
    ? [...gradient.stops].sort((a, b) => a.position - b.position)
    : gradient.stops;

  return stops.map((stop) => {
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
  const selectedLayerGradientPoints = getSelectedGradientStopPoints(
    state,
    true,
  );

  if (!selectedLayerGradientPoints) return -1;

  return selectedLayerGradientPoints.findIndex((gradientPoint) =>
    isPointInRange(gradientPoint.point, point, SELECTED_GRADIENT_POINT_RADIUS),
  );
}

export function getPercentageOfPointInGradient(
  state: ApplicationState,
  point: Point,
) {
  const selectedLayerGradientPoints = getSelectedGradientStopPoints(state);
  if (!selectedLayerGradientPoints) return 0;

  return getLinePercentage(point, [
    selectedLayerGradientPoints[0].point,
    selectedLayerGradientPoints[selectedLayerGradientPoints.length - 1].point,
  ]);
}

export function isPointerOnGradientLine(state: ApplicationState, point: Point) {
  const selectedLayerGradientPoints = getSelectedGradientStopPoints(state);
  if (!selectedLayerGradientPoints) return false;

  return isPointInLine(point, [
    selectedLayerGradientPoints[0].point,
    selectedLayerGradientPoints[selectedLayerGradientPoints.length - 1].point,
  ]);
}

export function isPointerOnGradientElipseEditor(
  state: ApplicationState,
  point: Point,
) {
  const selectedLayerGradientPoints = getSelectedGradientStopPoints(state);
  if (!state.selectedGradient || !selectedLayerGradientPoints) return false;
  const selectedGradient = getSelectedGradient(
    getCurrentPage(state),
    state.selectedGradient,
  );

  if (!selectedGradient) return false;

  const center = selectedLayerGradientPoints[0].point;
  const lastPoint =
    selectedLayerGradientPoints[selectedLayerGradientPoints.length - 1].point;

  const height = distance(center, lastPoint) * 2;
  const width = height * selectedGradient.elipseLength;

  // Maybe there is a function to do this in a more efficient way
  const theta =
    Math.atan2(lastPoint.y - center.y, lastPoint.x - center.x) - 1.5708;

  const cos = Math.cos(-theta);
  const sin = Math.sin(-theta);
  const x = center.x - width / 2;

  const position = {
    x: cos * (x - center.x) + sin * 0 + center.x,
    y: cos * 0 - sin * (x - center.x) + center.y,
  };

  return isPointInRange(point, position, SELECTED_GRADIENT_POINT_RADIUS);
}
