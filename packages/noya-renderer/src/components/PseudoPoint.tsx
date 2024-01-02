import { Point } from '@noya-app/noya-geometry';
import { useFill, useStroke } from 'noya-react-canvaskit';
import React from 'react';
import { useTheme } from 'styled-components';
import { useCanvasKit } from '../hooks/useCanvasKit';
import { EditablePathPoint } from './EditablePath';

interface PseudoPointProps {
  point: Point;
}

export default function PseudoPoint({ point }: PseudoPointProps) {
  const CanvasKit = useCanvasKit();
  const { primary } = useTheme().colors;

  const fill = useFill({ color: CanvasKit.WHITE });
  const stroke = useStroke({ color: primary });

  return <EditablePathPoint point={point} fill={fill} stroke={stroke} />;
}
