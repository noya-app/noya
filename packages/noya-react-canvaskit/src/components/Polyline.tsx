import { CanvasKit, Paint, Path } from 'canvaskit-wasm';
import { Point } from 'noya-state';
import { memo, useMemo } from 'react';
import { useReactCanvasKit } from '../contexts/ReactCanvasKitContext';
import useDeletable from '../hooks/useDeletable';
import usePaint, { PaintParameters } from '../hooks/usePaint';
import RCKPath from './Path';

interface PolylineProps {
  points: Point[];
  paint: Paint | PaintParameters;
}

function makePath(CanvasKit: CanvasKit, points: Point[]): Path {
  const path = new CanvasKit.Path();

  const [first, ...rest] = points;

  if (!first) return path;

  path.moveTo(first.x, first.y);

  rest.forEach((point) => {
    path.lineTo(point.x, point.y);
  });

  path.close();

  return path;
}

export default memo(function Polyline(props: PolylineProps) {
  const { CanvasKit } = useReactCanvasKit();
  const paint = usePaint(props.paint);
  const path = useMemo(() => makePath(CanvasKit, props.points), [
    CanvasKit,
    props.points,
  ]);
  useDeletable(path);

  return <RCKPath paint={paint} path={path} />;
});
