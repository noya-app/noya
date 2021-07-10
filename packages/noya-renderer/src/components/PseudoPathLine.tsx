import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CurvePoint } from '@sketch-hq/sketch-file-format-ts/dist/cjs/types';
import { useStroke } from 'noya-react-canvaskit';
import React from 'react';
import { useTheme } from 'styled-components';
import { Path, Primitives, useCanvasKit } from '..';

interface EditablePathPointProps {
  points: CurvePoint[];
  frame: Sketch.Rect;
}

export default function PseudoPathLine({
  points,
  frame,
}: EditablePathPointProps) {
  const CanvasKit = useCanvasKit();
  const { primary } = useTheme().colors;
  const stroke = useStroke({ color: primary });

  const path = Primitives.path(CanvasKit, points, frame, false);

  return <Path path={path} paint={stroke} />;
}
