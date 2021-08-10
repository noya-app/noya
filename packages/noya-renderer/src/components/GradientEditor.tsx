import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useApplicationState } from 'noya-app-state-context';
import { AffineTransform, distance } from 'noya-geometry';
import { useStroke } from 'noya-react-canvaskit';
import {
  getCurrentPage,
  getSelectedGradient,
  getAngularGradientCircumference,
  GradientStopPoint,
  Primitives,
  SelectedGradient,
  Selectors,
} from 'noya-state';
import { Fragment, memo, useMemo } from 'react';
import { Group, Path, Polyline, Rect } from '../ComponentsContext';
import { useCanvasKit } from '../hooks/useCanvasKit';

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

  const radialGradient = useMemo(() => {
    if (!gradient || gradient.gradientType !== Sketch.GradientType.Radial)
      return null;

    const center = gradientStopPoints[0].point;
    const point = gradientStopPoints[gradientStopPoints.length - 1].point;
    const len = distance(center, point);

    const height = len * 2;
    const width =
      gradient.elipseLength === 0 ? height : height * gradient.elipseLength;

    const x = center.x - width / 2;
    const y = center.y - len;

    const theta =
      Math.atan2(point.y - center.y, point.x - center.x) - Math.PI / 2;

    const path = new CanvasKit.Path();
    path.addOval(CanvasKit.XYWHRect(x, y, width, height));
    const rectangle = CanvasKit.XYWHRect(
      x - Selectors.SELECTED_GRADIENT_POINT_RADIUS / 2,
      center.y,
      Selectors.SELECTED_GRADIENT_POINT_RADIUS,
      Selectors.SELECTED_GRADIENT_POINT_RADIUS,
    );

    path.addRect(rectangle);

    const paint = new CanvasKit.Paint();
    paint.setColor(CanvasKit.parseColorString('#fef'));

    return (
      <Group transform={AffineTransform.rotate(theta, center.x, center.y)}>
        <Rect rect={rectangle} paint={paint} />
        <Path path={path} paint={gradientLineStroke} />
      </Group>
    );
  }, [gradient, CanvasKit, gradientLineStroke, gradientStopPoints]);

  const angularGradient = useMemo(() => {
    if (!gradient || gradient.gradientType !== Sketch.GradientType.Angular)
      return null;

    const gradientCircle = getAngularGradientCircumference(state);
    if (!gradientCircle) return null;

    const path = new CanvasKit.Path();
    path.addOval(
      CanvasKit.XYWHRect(
        gradientCircle.corner.x,
        gradientCircle.corner.y,
        gradientCircle.longitude,
        gradientCircle.longitude,
      ),
    );

    return <Path path={path} paint={gradientLineStroke} />;
  }, [CanvasKit, state, gradient, gradientLineStroke]);

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
      {angularGradient}
      {radialGradient}
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
