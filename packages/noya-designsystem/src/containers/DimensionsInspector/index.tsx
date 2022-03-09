import React, { useCallback } from 'react';

import { IconButton, Layout } from '../../components';
import FlipControls from '../FlipControls';
import { DimensionsInspectorProps } from './types';
import DimensionInput from './DimensionInput';

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
}: DimensionsInspectorProps) {
  return (
    <>
      <Layout.Row>
        <DimensionInput value={x} onSetValue={onSetX} label="X" />
        <Layout.Queue size="medium" />
        <DimensionInput value={y} onSetValue={onSetY} label="Y" />
        <Layout.Queue size="medium" />
        <DimensionInput value={rotation} onSetValue={onSetRotation} label="°" />
      </Layout.Row>
      <Layout.Stack size="medium" />
      <Layout.Row>
        <DimensionInput value={width} onSetValue={onSetWidth} label="W" />
        <Layout.Queue size={2} />
        <Layout.Center>
          <IconButton
            name={constrainProportions ? 'LockClosedIcon' : 'LockOpen1Icon'}
            size={12}
            onClick={useCallback(
              () => onSetConstraintProportions(!constrainProportions),
              [constrainProportions, onSetConstraintProportions],
            )}
          />
        </Layout.Center>
        <Layout.Queue size={2} />
        <DimensionInput value={height} onSetValue={onSetHeight} label="H" />
        <Layout.Queue size="medium" />
        <FlipControls
          supportsFlipping={supportsFlipping}
          isFlippedVertical={isFlippedVertical}
          isFlippedHorizontal={isFlippedHorizontal}
          onSetIsFlippedVertical={onSetIsFlippedVertical}
          onSetIsFlippedHorizontal={onSetIsFlippedHorizontal}
        />
      </Layout.Row>
    </>
  );
}
