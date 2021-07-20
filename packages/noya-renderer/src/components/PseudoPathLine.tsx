import Sketch from '@sketch-hq/sketch-file-format-ts';
import { CurvePoint } from '@sketch-hq/sketch-file-format-ts/dist/cjs/types';
import { useStroke } from 'noya-react-canvaskit';
import React from 'react';
import { useTheme } from 'styled-components';
import { Path, useCanvasKit } from '..';
import { Primitives } from 'noya-state';
import { Path as PathType } from 'canvaskit';

interface EditablePathPointProps {
  frame: Sketch.Rect;
  points: CurvePoint[];
  path?: PathType;
}

export default function PseudoPathLine({
  points,
  frame,
  path,
}: EditablePathPointProps) {
  const CanvasKit = useCanvasKit();
  const { primary } = useTheme().colors;
  const stroke = useStroke({ color: primary });

  const pseudoPath = path
    ? path
    : Primitives.path(CanvasKit, points, frame, false);

  return <Path path={pseudoPath} paint={stroke} />;
}
