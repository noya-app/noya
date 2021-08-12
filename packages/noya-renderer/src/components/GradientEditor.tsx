import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CanvasKit } from 'canvaskit';
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

const AngularGradientEditor = ({ CanvasKit }: { CanvasKit: CanvasKit }) => {
  const [state] = useApplicationState();

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
  CanvasKit,
}: {
  center: Point;
  point: Point;
  ellipseLength: number;
  CanvasKit: CanvasKit;
}) => {
  const gradientLineStroke = useStroke({ color: '#FFF' });
  const { rectangle, theta } = getCircleTangentSquare(
    center,
    point,
    ellipseLength,
  );

  const path = new CanvasKit.Path();
  path.addOval(
    CanvasKit.XYWHRect(
      rectangle.x,
      rectangle.y,
      rectangle.width,
      rectangle.height,
    ),
  );

  const ellipseEquare = CanvasKit.XYWHRect(
    rectangle.x - Selectors.SELECTED_GRADIENT_POINT_RADIUS / 2,
    center.y + rectangle.width / 2,
    Selectors.SELECTED_GRADIENT_POINT_RADIUS,
    Selectors.SELECTED_GRADIENT_POINT_RADIUS,
  );

  const paint = new CanvasKit.Paint();
  paint.setColor(CanvasKit.parseColorString('#fef'));

  path.addRect(ellipseEquare); // Small frame around the square
  return (
    <Group transform={AffineTransform.rotate(theta, center.x, center.y)}>
      <Rect rect={ellipseEquare} paint={paint} />
      <Path path={path} paint={gradientLineStroke} />
    </Group>
  );
};

export default memo(function GradientEditor({
  gradientStopPoints,
  selectedGradient,
}: {
  gradientStopPoints: GradientStopPoint[];
  selectedGradient: SelectedGradient;
}) {
  const [state] = useApplicationState();
  const CanvasKit = useCanvasKit();

  const gradientLineStroke = useStroke({ color: '#FFF' });
  const gradientStopStroke = useStroke({ color: '#FFF', strokeWidth: 1.5 });
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

  const { stopIndex } = selectedGradient;

  const gradient = getSelectedGradient(getCurrentPage(state), selectedGradient);
  if (!gradient) return null;

  return (
    <Group imageFilter={gradientEditorShadow}>
      {gradient.gradientType !== Sketch.GradientType.Angular && (
        <Polyline
          points={[
            gradientStopPoints[0].point,
            gradientStopPoints[gradientStopPoints.length - 1].point,
          ]}
          paint={gradientLineStroke}
        />
      )}
      {gradient.gradientType === Sketch.GradientType.Radial && (
        <RadialGradientEditor
          CanvasKit={CanvasKit}
          center={gradientStopPoints[0].point}
          point={gradientStopPoints[gradientStopPoints.length - 1].point}
          ellipseLength={gradient.elipseLength}
        />
      )}
      {gradient.gradientType === Sketch.GradientType.Angular && (
        <AngularGradientEditor CanvasKit={CanvasKit} />
      )}
      {gradientStopPoints.map(({ point, color }, index) => {
        const path = new CanvasKit.Path();

        const radius =
          index === stopIndex
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
          <Fragment key={index}>
            <Path path={path} paint={paint} />
            <Path path={path} paint={gradientStopStroke} />
          </Fragment>
        );
      })}
    </Group>
  );
});
