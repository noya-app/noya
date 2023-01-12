import { Spacer } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import React, { memo } from 'react';
import { DimensionInput, DimensionValue } from './DimensionInput';
import * as InspectorPrimitives from './InspectorPrimitives';

function roundNumber(number: number, roundTo: number) {
  return Number(number.toFixed(roundTo));
}

interface Props {
  x: DimensionValue;
  y: DimensionValue;
  onSetX: (value: number, mode: SetNumberMode) => void;
  onSetY: (value: number, mode: SetNumberMode) => void;
}

export const CoordinatesInspector = memo(function CoordinatesInspector({
  x,
  y,
  onSetX,
  onSetY,
}: Props) {
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
});
