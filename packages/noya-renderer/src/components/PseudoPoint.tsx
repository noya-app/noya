import { Point } from 'noya-geometry';
import {
  Path,
  useDeletable,
  useFill,
  useReactCanvasKit,
  useStroke,
} from 'noya-react-canvaskit';
import { POINT_RADIUS } from 'noya-state/src/selectors/pointSelectors';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';

interface PseudoPointProps {
  point: Point;
}

export default function PseudoPoint({ point }: PseudoPointProps) {
  const { CanvasKit } = useReactCanvasKit();
  const { primary } = useTheme().colors;

  const fill = useFill({ color: CanvasKit.WHITE });
  const stroke = useStroke({ color: primary });

  const path = useMemo(() => {
    const path = new CanvasKit.Path();

    path.addOval(
      CanvasKit.XYWHRect(
        point.x - POINT_RADIUS,
        point.y - POINT_RADIUS,
        POINT_RADIUS * 2,
        POINT_RADIUS * 2,
      ),
    );

    return path;
  }, [CanvasKit, point.x, point.y]);

  useDeletable(path);

  return (
    <>
      <Path path={path} paint={fill} />
      <Path path={path} paint={stroke} />
    </>
  );
}
