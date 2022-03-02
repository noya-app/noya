import { Paint } from 'canvaskit-types';
import { Point } from 'noya-geometry';
import { useCanvasKit } from 'noya-renderer';
import { memo, useMemo } from 'react';
import useDeletable from '../hooks/useDeletable';
import usePaint from '../hooks/usePaint';
import makePath from '../utils/makePath';
import RCKPath from './Path';

interface PolylineProps {
  points: Point[];
  paint: Paint;
}

export default memo(function Polyline(props: PolylineProps) {
  const CanvasKit = useCanvasKit();
  const paint = usePaint(props.paint);
  const path = useMemo(
    () => makePath(CanvasKit, props.points),
    [CanvasKit, props.points],
  );
  useDeletable(path);

  return <RCKPath paint={paint} path={path} />;
});
