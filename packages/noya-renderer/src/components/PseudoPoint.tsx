import { Point } from 'noya-geometry';
import { useFill, useReactCanvasKit, useStroke } from 'noya-react-canvaskit';
import React from 'react';
import { useTheme } from 'styled-components';
import { EditablePathPoint } from './EditablePath';

interface PseudoPointProps {
  point: Point;
}

export default function PseudoPoint({ point }: PseudoPointProps) {
  const { CanvasKit } = useReactCanvasKit();
  const { primary } = useTheme().colors;

  const fill = useFill({ color: CanvasKit.WHITE });
  const stroke = useStroke({ color: primary });

  return <EditablePathPoint point={point} fill={fill} stroke={stroke} />;
}
