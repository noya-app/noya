import React from 'react';
import { useTheme } from 'styled-components';

import Sketch from 'noya-file-format';
import { Primitives } from 'noya-state';
import { useStroke } from 'noya-react-canvaskit';
import { useCanvasKit } from '../hooks/useCanvasKit';
import { Path } from '../contexts/ComponentsContext';

interface EditablePathPointProps {
  frame: Sketch.Rect;
  points: Sketch.CurvePoint[];
}

export default function PseudoPathLine({
  points,
  frame,
}: EditablePathPointProps) {
  const CanvasKit = useCanvasKit();
  const { primary } = useTheme().colors;
  const stroke = useStroke({ color: primary });

  const pseudoPath = Primitives.path(CanvasKit, points, frame, false);

  return <Path path={pseudoPath} paint={stroke} />;
}
