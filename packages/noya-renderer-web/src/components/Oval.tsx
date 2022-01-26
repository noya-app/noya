import { Paint } from 'canvaskit';
import { Point } from 'noya-geometry';
import { useDeletable } from 'noya-react-canvaskit';
import { memo } from 'react';
import { Path } from '../ComponentsContext';
import { useCanvasKit } from '../hooks/useCanvasKit';

interface Props {
  center: Point;
  radius: number | Point;
  paint: Paint;
}

export const Oval = memo(function Oval({ center, radius, paint }: Props) {
  const CanvasKit = useCanvasKit();

  const path = new CanvasKit.Path();

  const { x: radiusX, y: radiusY } =
    typeof radius === 'number' ? { x: radius, y: radius } : radius;

  path.addOval(
    CanvasKit.XYWHRect(
      center.x - radiusX,
      center.y - radiusY,
      radiusX * 2,
      radiusY * 2,
    ),
  );

  useDeletable(path);

  return <Path path={path} paint={paint} />;
});
