import Sketch from 'noya-file-format';
import {
  AffineTransform,
  createBounds,
  distance,
  getCirclePercentage,
  getLinePercentage,
  isPointOnCircumference,
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
import {
  getLayerFlipTransform,
  getLayerRotationTransform,
} from './transformSelectors';

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

  const gradient = layer.style?.[styleType]?.[fillIndex].gradient;

  if (!gradient) return;

  const stops = sorted
    ? [...gradient.stops].sort((a, b) => a.position - b.position)
    : gradient.stops;

  if (gradient.gradientType === Sketch.GradientType.Angular) {
    const circle = getAngularGradientCircle(state);

    if (!circle) return;

    const { center, radius, rotation } = circle;

    return stops.map((stop) => {
      const radians = stop.position * Math.PI * 2 + rotation;

      return {
        color: stop.color,
        point: {
          x: radius * Math.cos(radians) + center.x,
          y: radius * Math.sin(radians) + center.y,
        },
      };
    });
  } else {
    const transform = getLayerTransformAtIndexPath(
      page,
      indexPath,
      AffineTransform.identity,
      'includeLast',
    ).scale(layer.frame.width, layer.frame.height);

    const from = PointString.decode(gradient.from);
    const to = PointString.decode(gradient.to);

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

  if (gradient.gradientType === Sketch.GradientType.Angular) {
    gradient.stops = sorted;
  } else {
    gradient.stops = stopPoints.map((stopPoint) => {
      return {
        _class: Sketch.ClassValue.GradientStop,
        color: stopPoint.color,
        position: getLinePercentage(stopPoint.point, [newFrom, newTo]),
      };
    });
  }
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
    const circle = getAngularGradientCircle(state);

    if (!circle) return 0;

    return getCirclePercentage(point, circle.center);
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
    const circle = getAngularGradientCircle(state);

    if (!circle) return false;

    return isPointOnCircumference(point, circle);
  }

  const selectedLayerGradientPoints = getSelectedGradientStopPoints(state);
  if (!selectedLayerGradientPoints) return false;

  return isPointInLine(point, [
    selectedLayerGradientPoints[0].point,
    selectedLayerGradientPoints[selectedLayerGradientPoints.length - 1].point,
  ]);
}

export function getCircleTangentSquare(
  center: Point,
  point: Point,
  ellipseLength: number,
) {
  const len = distance(center, point);
  const height = len * 2;
  const width = ellipseLength === 0 ? height : height * ellipseLength;

  const theta =
    Math.atan2(point.y - center.y, point.x - center.x) - Math.PI / 2;

  return {
    rectangle: {
      x: center.x - width / 2,
      y: center.y - len,
      height,
      width,
    },
    theta,
  };
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

  const { rectangle, theta } = getCircleTangentSquare(
    center,
    lastPoint,
    selectedGradient.elipseLength,
  );

  const position = AffineTransform.rotate(theta, center).applyTo({
    x: rectangle.x,
    y: center.y,
  });

  return isPointInRange(point, position, SELECTED_GRADIENT_POINT_RADIUS);
}

export function getAngularGradientCircle(state: ApplicationState) {
  if (!state.selectedGradient) return;

  const { layerId } = state.selectedGradient;
  const page = getCurrentPage(state);
  const indexPath = Layers.findIndexPath(
    page,
    (layer) => layer.do_objectID === layerId,
  );

  if (!indexPath) return;

  const layer = Layers.access(page, indexPath);
  const transform = getLayerTransformAtIndexPath(page, indexPath)
    .prepend(getLayerFlipTransform(layer))
    .prepend(getLayerRotationTransform(layer));

  const bounds = createBounds(layer.frame);
  const center = transform.applyTo({ x: bounds.midX, y: bounds.midY });

  const radius = Math.max(layer.frame.width, layer.frame.height) / 2;

  const line = transform.applyTo({ x: bounds.maxX, y: bounds.midY });
  const rotation = Math.atan2(line.y - center.y, line.x - center.x);

  return {
    center,
    radius,
    rotation,
  };
}
