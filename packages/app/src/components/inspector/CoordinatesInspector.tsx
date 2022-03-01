import { Spacer } from 'noya-web-designsystem';
import { SetNumberMode } from 'noya-state';
import React from 'react';
import * as InspectorPrimitives from '../inspector/InspectorPrimitives';
import DimensionInput from './DimensionInput';
import { DimensionValue } from './DimensionsInspector';

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
    <InspectorPrimitives.Row>
      <DimensionInput
        value={x ? roundNumber(x, 2) : undefined}
        onSetValue={onSetX}
        label="X"
      />
      <Spacer.Horizontal size={16} />
      <DimensionInput
        value={y ? roundNumber(y, 2) : undefined}
        onSetValue={onSetY}
        label="Y"
      />
    </InspectorPrimitives.Row>
  );
}
