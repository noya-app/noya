import React from 'react';

import { Platform } from 'noya-utils';
import { DimensionInput, DimensionValue } from './DimensionsInspector';
import { Layout } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { Primitives } from './primitives';

function roundNumber(number: number, roundTo: number) {
  return Number(number.toFixed(roundTo));
}

export interface Props {
  x: DimensionValue;
  y: DimensionValue;
  onSetX: (value: number, mode: SetNumberMode) => void;
  onSetY: (value: number, mode: SetNumberMode) => void;
}

export default function CoordinatesInspector({ x, y, onSetX, onSetY }: Props) {
  return (
    <Primitives.Row style={Platform.isNative ? { flex: 1 } : {}}>
      <DimensionInput
        value={x ? roundNumber(x, 2) : undefined}
        onSetValue={onSetX}
        label="X"
      />
      <Layout.Queue size={16} />
      <DimensionInput
        value={y ? roundNumber(y, 2) : undefined}
        onSetValue={onSetY}
        label="Y"
      />
    </Primitives.Row>
  );
}
