import { Point } from '@noya-app/noya-geometry';
import { Paint } from '@noya-app/noya-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import React, { memo, useMemo } from 'react';
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
