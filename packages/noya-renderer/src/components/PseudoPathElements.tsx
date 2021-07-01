import { Point } from 'noya-geometry';
import {
  Path,
  Polyline,
  useDeletable,
  useFill,
  useReactCanvasKit,
  useStroke,
} from 'noya-react-canvaskit';
import { POINT_RADIUS } from 'noya-state/src/selectors/pointSelectors';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Primitives } from '..';
import { SelectedPointLists } from '../../../noya-state/src';
import { PointsLayer } from '../../../noya-state/src/layers';

interface EditablePathPointProps {
  point: Point;
  selectedPoints: SelectedPointLists;
  layer: PointsLayer | undefined;
}

export default function PseudoPathElements({
  point,
  selectedPoints,
  layer,
}: EditablePathPointProps) {
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

  let points: Point[] = [];
  if (layer) {
    const decodedPoint = Primitives.decodeCurvePoint(
      layer.points[layer.points.length - 1],
      layer.frame,
    );

    points = [point, decodedPoint.point];
  }

  useDeletable(path);

  return (
    <>
      {layer && <Polyline points={points} paint={stroke} />}

      <Path path={path} paint={fill} />
      <Path path={path} paint={stroke} />
    </>
  );
}
