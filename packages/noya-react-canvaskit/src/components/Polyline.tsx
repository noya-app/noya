import { Paint } from 'canvaskit';
import { Point } from 'noya-state';
import { memo, useMemo } from 'react';
import { useReactCanvasKit } from '../contexts/ReactCanvasKitContext';
import useDeletable from '../hooks/useDeletable';
import usePaint from '../hooks/usePaint';
import makePath from '../utils/makePath';
import RCKPath from './Path';

interface PolylineProps {
  points: Point[];
  paint: Paint;
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
