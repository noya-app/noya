import { FlipHorizontalIcon, FlipVerticalIcon } from '@noya-app/noya-icons';
import { Button, Spacer } from 'noya-designsystem';
import React, { memo, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';

const Container = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
}));

interface Props {
  supportsFlipping: boolean;
  isFlippedVertical: boolean;
  isFlippedHorizontal: boolean;
  onSetIsFlippedVertical: (value: boolean) => void;
  onSetIsFlippedHorizontal: (value: boolean) => void;
}

export const FlipControls = memo(function FlipControls({
  supportsFlipping,
  isFlippedVertical,
  isFlippedHorizontal,
  onSetIsFlippedVertical,
  onSetIsFlippedHorizontal,
}: Props) {
  const { icon: iconColor, iconSelected: iconSelectedColor } =
    useTheme().colors;

  const handleSetIsFlippedVertical = useCallback(
    () => onSetIsFlippedVertical(!isFlippedVertical),
    [isFlippedVertical, onSetIsFlippedVertical],
  );

  const handleSetIsFlippedHorizontal = useCallback(
    () => onSetIsFlippedHorizontal(!isFlippedHorizontal),
    [isFlippedHorizontal, onSetIsFlippedHorizontal],
  );

  return (
    <Container>
      <Button
        id="flip-horizontal"
        tooltip="Flip horizontally"
        onClick={handleSetIsFlippedHorizontal}
        active={isFlippedHorizontal}
        disabled={!supportsFlipping}
      >
        <FlipHorizontalIcon
          color={isFlippedHorizontal ? iconSelectedColor : iconColor}
        />
      </Button>
      <Spacer.Horizontal />
      <Button
        id="flip-vertical"
        tooltip="Flip vertically"
        onClick={handleSetIsFlippedVertical}
        active={isFlippedVertical}
        disabled={!supportsFlipping}
      >
        <FlipVerticalIcon
          color={isFlippedVertical ? iconSelectedColor : iconColor}
        />
      </Button>
    </Container>
  );
});
