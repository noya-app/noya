import { Point } from 'noya-geometry';
import { useFill, useStroke } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer-web';
import React from 'react';
import { useTheme } from 'styled-components';
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
