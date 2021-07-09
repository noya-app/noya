import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CurvePoint } from '@sketch-hq/sketch-file-format-ts/dist/cjs/types';
import { Point } from 'noya-geometry';
import { useStroke } from 'noya-react-canvaskit';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Path, Primitives, useCanvasKit } from '..';
import { DecodedCurvePoint, encodeCurvePoint } from '../primitives/path';

interface EditablePathPointProps {
  point: Point;
  curvePoint: CurvePoint;
  layer: Sketch.AnyLayer;
}

export default function PseudoPathLine({
  point,
  curvePoint,
  layer,
}: EditablePathPointProps) {
  const CanvasKit = useCanvasKit();
  const { primary } = useTheme().colors;
  const stroke = useStroke({ color: primary });

  const decodedPointToDraw: DecodedCurvePoint = {
    _class: 'curvePoint',
    cornerRadius: 0,
    curveFrom: point,
    curveTo: point,
    hasCurveFrom: false,
    hasCurveTo: false,
    curveMode: Sketch.CurveMode.Straight,
    point,
  };

  const encodedPointToDraw = encodeCurvePoint(decodedPointToDraw, layer.frame);

  const points = useMemo(() => {
    return [encodedPointToDraw, curvePoint];
  }, [encodedPointToDraw, curvePoint]);

  const path = Primitives.path(CanvasKit, points, layer.frame, false);

  const strokedPath = useMemo(
    () => Primitives.getStrokedBorderPath(CanvasKit, path, 1, 0),
    [CanvasKit, path],
  );

  return <Path path={strokedPath} paint={stroke} />;
}
