import React, { useCallback } from 'react';

import { Layout, IconButton } from 'noya-designsystem';

export interface FlipControlsProps {
  supportsFlipping: boolean;
  isFlippedVertical: boolean;
  isFlippedHorizontal: boolean;
  onSetIsFlippedVertical: (value: boolean) => void;
  onSetIsFlippedHorizontal: (value: boolean) => void;
}

export default function FlipControls({
  supportsFlipping,
  isFlippedVertical,
  isFlippedHorizontal,
  onSetIsFlippedVertical,
  onSetIsFlippedHorizontal,
}: FlipControlsProps) {
  const handleSetIsFlippedVertical = useCallback(
    () => onSetIsFlippedVertical(!isFlippedVertical),
    [isFlippedVertical, onSetIsFlippedVertical],
  );

  const handleSetIsFlippedHorizontal = useCallback(
    () => onSetIsFlippedHorizontal(!isFlippedHorizontal),
    [isFlippedHorizontal, onSetIsFlippedHorizontal],
  );

  return (
    <Layout.Row spacing={0}>
      <IconButton
        id="flip-horizontal"
        tooltip="Flip horizontally"
        onClick={handleSetIsFlippedHorizontal}
        active={isFlippedHorizontal}
        disabled={!supportsFlipping}
        name="flip-horizontal"
        variant="normal"
      />
      <Layout.Queue size="small" />
      <IconButton
        id="flip-vertical"
        tooltip="Flip vertically"
        onClick={handleSetIsFlippedVertical}
        active={isFlippedVertical}
        disabled={!supportsFlipping}
        name="flip-vertical"
        variant="normal"
      />
    </Layout.Row>
  );
}
