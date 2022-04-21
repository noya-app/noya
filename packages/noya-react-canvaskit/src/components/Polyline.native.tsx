import React, { memo, useMemo } from 'react';

import type { PaintNative, PathNative } from 'noya-native-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import type { Point } from 'noya-geometry';
import useDeletable from '../hooks/useDeletable';
import makePath from '../utils/makePath';
import RCKPath from './Path.native';

interface NativePoylineProps {
  points: Point[];
  paint: PaintNative;
}

const Polyline: React.FC<NativePoylineProps> = (props) => {
  const CanvasKit = useCanvasKit();

  const path = useMemo(
    () => makePath(CanvasKit, props.points) as unknown as PathNative,
    [CanvasKit, props.points],
  );

  useDeletable(path);

  return <RCKPath path={path} paint={props.paint} />;
};

export default memo(Polyline);
