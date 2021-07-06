import { Point } from 'noya-geometry';
import { Polyline, useStroke } from 'noya-react-canvaskit';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Primitives } from '..';

interface EditablePathPointProps {
  point: Point;
  decodedCurvePoint: Primitives.DecodedCurvePoint;
}

export default function PseudoPathLine({
  point,
  decodedCurvePoint,
}: EditablePathPointProps) {
  const { primary } = useTheme().colors;

  const stroke = useStroke({ color: primary });

  const points = useMemo(() => {
    return [point, decodedCurvePoint.point];
  }, [decodedCurvePoint.point, point]);

  return <Polyline points={points} paint={stroke} />;
}
