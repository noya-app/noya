import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useApplicationState } from 'noya-app-state-context';
import { AffineTransform, Point } from 'noya-geometry';
import { useStroke } from 'noya-react-canvaskit';
import {
  getCurrentPage,
  getSelectedGradient,
  getAngularGradientCircle,
  GradientStopPoint,
  Primitives,
  SelectedGradient,
  Selectors,
  getCircleTangentSquare,
} from 'noya-state';
import { Fragment, memo, useMemo } from 'react';
import { Group, Path, Polyline, Rect } from '../ComponentsContext';
import { useCanvasKit } from '../hooks/useCanvasKit';

const AngularGradientEditor = () => {
  const [state] = useApplicationState();
  const CanvasKit = useCanvasKit();

  const gradientLineStroke = useStroke({ color: '#FFF' });

  const gradientCircle = getAngularGradientCircle(state);

  if (!gradientCircle) return null;

  const path = new CanvasKit.Path();
  path.addOval(
    CanvasKit.XYWHRect(
      gradientCircle.center.x - gradientCircle.radius,
      gradientCircle.center.y - gradientCircle.radius,
      gradientCircle.radius * 2,
      gradientCircle.radius * 2,
    ),
  );

  return <Path path={path} paint={gradientLineStroke} />;
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
  const gradientLineStroke = useStroke({ color: '#FFF' });

  const { rectangle, theta } = getCircleTangentSquare(
    center,
    point,
    ellipseLength,
  );
  const CanvasKit = useCanvasKit();

  const path = new CanvasKit.Path();
  path.addOval(
    CanvasKit.XYWHRect(
      rectangle.x,
      rectangle.y,
      rectangle.width,
      rectangle.height,
    ),
  );

  const ellipseSquare = CanvasKit.XYWHRect(
    rectangle.x - Selectors.SELECTED_GRADIENT_POINT_RADIUS / 2,
    center.y,
    Selectors.SELECTED_GRADIENT_POINT_RADIUS,
    Selectors.SELECTED_GRADIENT_POINT_RADIUS,
  );

  const paint = new CanvasKit.Paint();

  paint.setColor(CanvasKit.parseColorString('#fef'));
  path.addRect(ellipseSquare); // Small frame around the square
  return (
    <Group transform={AffineTransform.rotate(theta, center.x, center.y)}>
      <Rect rect={ellipseSquare} paint={paint} />
      <Path path={path} paint={gradientLineStroke} />
    </Group>
  );
};

const StopPoint = ({
  point,
  color,
  selected,
}: {
  point: Point;
  color: Sketch.Color;
  selected: boolean;
}) => {
  const CanvasKit = useCanvasKit();
  const path = new CanvasKit.Path();
  const gradientStopStroke = useStroke({ color: '#FFF', strokeWidth: 1.5 });

  const radius = selected
    ? Selectors.POINT_RADIUS * 1.5
    : Selectors.POINT_RADIUS;

  path.addOval(
    CanvasKit.XYWHRect(
      point.x - radius,
      point.y - radius,
      radius * 2,
      radius * 2,
    ),
  );

  const paint = new CanvasKit.Paint();
  paint.setColor(Primitives.color(CanvasKit, color));

  return (
    <Fragment>
      <Path path={path} paint={paint} />
      <Path path={path} paint={gradientStopStroke} />
    </Fragment>
  );
};

export default memo(function GradientEditor({
  selectedGradient,
  gradientStopPoints,
}: {
  selectedGradient: SelectedGradient;
  gradientStopPoints: GradientStopPoint[];
}) {
  const [state] = useApplicationState();
  const CanvasKit = useCanvasKit();

  const gradientLineStroke = useStroke({ color: '#FFF' });
  const gradientEditorShadow = useMemo(
    () =>
      CanvasKit.ImageFilter.MakeDropShadowOnly(
        0,
        0,
        2,
        2,
        CanvasKit.Color(0, 0, 0, 0.5),
        null,
      ),

    [CanvasKit],
  );

  const gradient = getSelectedGradient(getCurrentPage(state), selectedGradient);
  if (!gradient) return null;

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
          selected={index === selectedGradient.stopIndex}
        />
      ))}
    </Group>
  );
});
