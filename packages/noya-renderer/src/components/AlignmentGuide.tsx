import { Point } from 'noya-geometry';
import { useStroke } from 'noya-react-canvaskit';
import React, { useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Polyline } from '..';
import { pixelAlignPoints } from '../pixelAlignment';

interface Props {
  points: [Point, Point];
}

export default function AlignmentGuide({ points }: Props) {
  const primaryColor = useTheme().colors.primary;

  const snapGuidePaint = useStroke({ color: primaryColor });

  const alignedPoints = useMemo(() => pixelAlignPoints(points), [points]);

  return <Polyline paint={snapGuidePaint} points={alignedPoints} />;
}
