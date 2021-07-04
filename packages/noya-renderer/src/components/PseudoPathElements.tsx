import { Point } from 'noya-geometry';
import { Polyline, useStroke } from 'noya-react-canvaskit';
import React from 'react';
import { useTheme } from 'styled-components';
import { Primitives } from '..';
import { PointsLayer } from '../../../noya-state/src/layers';

interface EditablePathPointProps {
  point: Point;
  layer: PointsLayer | undefined;
}

export default function PseudoPathElements({
  point,
  layer,
}: EditablePathPointProps) {
  const { primary } = useTheme().colors;

  const stroke = useStroke({ color: primary });

  let points: Point[] = [];

  if (layer) {
    const decodedPoint = Primitives.decodeCurvePoint(
      layer.points[layer.points.length - 1],
      layer.frame,
    );

    points = [point, decodedPoint.point];
  }

  return <>{layer && <Polyline points={points} paint={stroke} />}</>;
}
