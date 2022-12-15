import { IconButton, Spacer } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import DimensionInput, { DimensionValue } from './DimensionInput';
import FlipControls from './FlipControls';
import * as InspectorPrimitives from './InspectorPrimitives';

const Row = styled.div(({ theme }) => ({
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'row',
  paddingLeft: '10px',
  paddingRight: '10px',
}));

export interface Props {
  x: DimensionValue;
  y: DimensionValue;
  width: DimensionValue;
  height: DimensionValue;
  rotation: DimensionValue;
  isFlippedVertical: boolean;
  isFlippedHorizontal: boolean;
  constrainProportions: boolean;
  supportsFlipping: boolean;
  onSetX: (value: number, mode: SetNumberMode) => void;
  onSetY: (value: number, mode: SetNumberMode) => void;
  onSetWidth: (value: number, mode: SetNumberMode) => void;
  onSetHeight: (value: number, mode: SetNumberMode) => void;
  onSetRotation: (value: number, mode: SetNumberMode) => void;
  onSetIsFlippedVertical: (value: boolean) => void;
  onSetIsFlippedHorizontal: (value: boolean) => void;
  onSetConstraintProportions: (value: boolean) => void;
}

export default function DimensionsInspector({
  x,
  y,
  width,
  height,
  rotation,
  isFlippedVertical,
  isFlippedHorizontal,
  constrainProportions,
  supportsFlipping,
  onSetX,
  onSetY,
  onSetWidth,
  onSetHeight,
  onSetRotation,
  onSetIsFlippedVertical,
  onSetIsFlippedHorizontal,
  onSetConstraintProportions,
}: Props) {
  return (
    <>
      <Row>
        <DimensionInput value={x} onSetValue={onSetX} label="X" />
        <Spacer.Horizontal size={16} />
        <DimensionInput value={y} onSetValue={onSetY} label="Y" />
        <Spacer.Horizontal size={16} />
        <DimensionInput value={rotation} onSetValue={onSetRotation} label="°" />
      </Row>
      <InspectorPrimitives.VerticalSeparator />
      <Row>
        <DimensionInput value={width} onSetValue={onSetWidth} label="W" />
        <Spacer.Horizontal size={2} />
        <IconButton
          iconName={constrainProportions ? 'LockClosedIcon' : 'LockOpen1Icon'}
          size={12}
          onClick={useCallback(
            () => onSetConstraintProportions(!constrainProportions),
            [constrainProportions, onSetConstraintProportions],
          )}
        />
        <Spacer.Horizontal size={2} />
        <DimensionInput value={height} onSetValue={onSetHeight} label="H" />
        <Spacer.Horizontal size={16} />
        <FlipControls
          supportsFlipping={supportsFlipping}
          isFlippedVertical={isFlippedVertical}
          isFlippedHorizontal={isFlippedHorizontal}
          onSetIsFlippedVertical={onSetIsFlippedVertical}
          onSetIsFlippedHorizontal={onSetIsFlippedHorizontal}
        />
      </Row>
    </>
  );
}
