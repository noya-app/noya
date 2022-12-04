import { useApplicationState } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { AffineTransform, Point } from 'noya-geometry';
import { useColorFill, useStroke } from 'noya-react-canvaskit';
import {
  getAngularGradientCircle,
  getCircleTangentSquare,
  Primitives,
  Selectors,
} from 'noya-state';
import React, { Fragment, memo, useMemo } from 'react';
import { Group, Polyline, Rect } from '../ComponentsContext';
import { useCanvasKit } from '../hooks/useCanvasKit';
import { useZoom } from '../ZoomContext';
import { Oval } from './Oval';

const AngularGradientEditor = () => {
  const [state] = useApplicationState();

  const gradientLineStroke = useStroke({ color: '#FFF' });

  const gradientCircle = getAngularGradientCircle(state);

  if (!gradientCircle) return null;

  return (
    <Oval
      center={gradientCircle.center}
      radius={gradientCircle.radius}
      paint={gradientLineStroke}
    />
  );
};

const RadialGradientEditor = ({
  center,
  point,
  ellipseLength,
}: {
  center: Point;
  point: Point;
  ellipseLength: number;
}) => {
  const CanvasKit = useCanvasKit();
  const zoom = useZoom();

  const gradientLineStroke = useStroke({
    color: '#FFF',
    strokeWidth: 1 / zoom,
  });
  const handleFill = useColorFill('#FFF');

  const { rectangle, theta } = getCircleTangentSquare(
    center,
    point,
    ellipseLength,
  );

  const handleRect = CanvasKit.XYWHRect(
    rectangle.x - Selectors.SELECTED_GRADIENT_POINT_RADIUS / (2 * zoom),
    center.y,
    Selectors.SELECTED_GRADIENT_POINT_RADIUS / zoom,
    Selectors.SELECTED_GRADIENT_POINT_RADIUS / zoom,
  );

  return (
    <Group transform={AffineTransform.rotate(theta, center)}>
      <Rect rect={handleRect} paint={handleFill} />
      <Oval
        center={center}
        radius={useMemo(
          () => ({
            x: rectangle.width / 2,
            y: rectangle.height / 2,
          }),
          [rectangle.height, rectangle.width],
        )}
        paint={gradientLineStroke}
      />
    </Group>
  );
};

const StopPoint = memo(function StopPoint({
  point,
  color,
  selected,
}: {
  point: Point;
  color: Sketch.Color;
  selected: boolean;
}) {
  const CanvasKit = useCanvasKit();
  const zoom = useZoom();

  const strokePaint = useStroke({
    color: '#FFF',
    strokeWidth: 1.5 / zoom,
  });

  const fillPaint = useColorFill(Primitives.color(CanvasKit, color));

  const radius =
    (selected ? Selectors.POINT_RADIUS * 1.5 : Selectors.POINT_RADIUS) / zoom;

  return (
    <Fragment>
      <Oval center={point} radius={radius} paint={fillPaint} />
      <Oval center={point} radius={radius} paint={strokePaint} />
    </Fragment>
  );
});

export default memo(function GradientEditor({
  gradient,
  selectedStopIndex,
}: {
  gradient: Sketch.Gradient;
  selectedStopIndex: number;
}) {
  const CanvasKit = useCanvasKit();
  const [state] = useApplicationState();
  const gradientStopPoints = Selectors.getSelectedGradientStopPoints(state);
  const zoom = useZoom();

  const gradientLineStroke = useStroke({
    color: '#FFF',
    strokeWidth: 1 / zoom,
  });
  const gradientEditorShadow = useMemo(
    () =>
      CanvasKit.ImageFilter.MakeDropShadowOnly(
        0,
        0,
        2 / zoom,
        2 / zoom,
        CanvasKit.Color(0, 0, 0, 0.5),
        null,
      ),

    [CanvasKit, zoom],
  );

  if (!gradientStopPoints) return null;

  const from = gradientStopPoints[0].point;
  const to = gradientStopPoints[gradientStopPoints.length - 1].point;

  return (
    <Group imageFilter={gradientEditorShadow}>
      {gradient.gradientType !== Sketch.GradientType.Angular && (
        <Polyline points={[from, to]} paint={gradientLineStroke} />
      )}
      {gradient.gradientType === Sketch.GradientType.Radial && (
        <RadialGradientEditor
          center={from}
          point={to}
          ellipseLength={gradient.elipseLength}
        />
      )}
      {gradient.gradientType === Sketch.GradientType.Angular && (
        <AngularGradientEditor />
      )}
      {gradientStopPoints.map(({ point, color }, index) => (
        <StopPoint
          key={index}
          point={point}
          color={color}
          selected={index === selectedStopIndex}
        />
      ))}
    </Group>
  );
});
