import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  AffineTransform,
  createBounds,
  distance,
  getCircumferencePercentage,
  getLinePercentage,
  isPointInCircumference,
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

export type GradientStopPoint = { point: Point; color: Sketch.Color };

//return angular position of the point on the gradient line
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

  const stops = sorted
    ? [...gradient.stops].sort((a, b) => a.position - b.position)
    : gradient.stops;

  if (gradient.gradientType === Sketch.GradientType.Angular) {
    const circumference = getAngularGradientCircumference(state);
    if (!circumference) return;

    return stops.map((stop) => {
      const radians = stop.position * Math.PI * 2;
      const { center, longitude } = circumference;

      return {
        color: stop.color,
        point: {
          x: (longitude / 2) * Math.cos(radians) + center.x,
          y: (longitude / 2) * Math.sin(radians) + center.y,
        },
      };
    });
  }

  const extremePoints = {
    from: transform.applyTo(from),
    to: transform.applyTo(to),
  };

  return stops.map((stop) => ({
    color: stop.color,
    point: {
      x: lerp(extremePoints.from.x, extremePoints.to.x, stop.position),
      y: lerp(extremePoints.from.y, extremePoints.to.y, stop.position),
    },
  }));
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

  if (gradient.gradientType === Sketch.GradientType.Angular) {
    gradient.stops = sorted;
    return;
  }
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
  if (!state.selectedGradient) return 0;

  const gradient = getSelectedGradient(
    getCurrentPage(state),
    state.selectedGradient,
  );

  if (!gradient) return 0;
  if (gradient.gradientType === Sketch.GradientType.Angular) {
    const circumference = getAngularGradientCircumference(state);
    if (!circumference) return 0;

    const percentage = getCircumferencePercentage(point, circumference.center);
    return percentage;
  }

  const selectedLayerGradientPoints = getSelectedGradientStopPoints(state);
  if (!selectedLayerGradientPoints) return 0;

  return getLinePercentage(point, [
    selectedLayerGradientPoints[0].point,
    selectedLayerGradientPoints[selectedLayerGradientPoints.length - 1].point,
  ]);
}

export function isPointerOnGradientLine(state: ApplicationState, point: Point) {
  if (!state.selectedGradient) return false;

  const gradient = getSelectedGradient(
    getCurrentPage(state),
    state.selectedGradient,
  );

  if (!gradient) return false;

  if (gradient.gradientType === Sketch.GradientType.Angular) {
    const circumference = getAngularGradientCircumference(state);
    if (!circumference) return false;

    return isPointInCircumference(point, [
      circumference.center,
      circumference.longitude / 2,
    ]);
  }

  const selectedLayerGradientPoints = getSelectedGradientStopPoints(state);
  if (!selectedLayerGradientPoints) return false;

  return isPointInLine(point, [
    selectedLayerGradientPoints[0].point,
    selectedLayerGradientPoints[selectedLayerGradientPoints.length - 1].point,
  ]);
}

export function getEllipseEditorPoint(
  center: Point,
  point: Point,
  ellipseLength: number,
): Point {
  const height = distance(center, point) * 2;
  const width = ellipseLength === 0 ? height : height * ellipseLength;

  const theta =
    Math.atan2(point.y - center.y, point.x - center.x) - Math.PI / 2;

  return AffineTransform.rotate(theta, center.x, center.y).applyTo({
    x: center.x - width / 2,
    y: center.y,
  });
}

export function isPointerOnGradientEllipseEditor(
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

  const position = getEllipseEditorPoint(
    center,
    lastPoint,
    selectedGradient.elipseLength,
  );

  return isPointInRange(point, position, SELECTED_GRADIENT_POINT_RADIUS);
}

export function getAngularGradientCircumference(state: ApplicationState) {
  if (!state.selectedGradient) return;

  const { layerId } = state.selectedGradient;
  const page = getCurrentPage(state);
  const indexPath = Layers.findIndexPath(
    page,
    (layer) => layer.do_objectID === layerId,
  );

  if (!indexPath) return;

  const layer = Layers.access(page, indexPath);
  const bounds = createBounds(layer.frame);

  const horizontalDistance = distance(
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
  );
  const verticalDistance = distance(
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.minX, y: bounds.maxY },
  );

  const center = { x: bounds.midX, y: bounds.midY };
  const point =
    horizontalDistance < verticalDistance
      ? { x: bounds.maxX, y: bounds.midY }
      : { x: bounds.midX, y: bounds.minY };

  const longitude = distance(center, point) * 2;

  const corner =
    horizontalDistance < verticalDistance
      ? { x: bounds.minX, y: bounds.midY - longitude / 2 }
      : { x: bounds.midX - longitude / 2, y: bounds.minY };

  return {
    corner,
    center,
    longitude,
  };
}
