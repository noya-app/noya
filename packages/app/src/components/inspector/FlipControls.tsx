import { Button, Spacer } from 'noya-designsystem';
import { useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import FlipHorizontalIcon from '../icons/FlipHorizontalIcon';
import FlipVerticalIcon from '../icons/FlipVerticalIcon';

export type DimensionValue = number | undefined;

const FlipButtonContainer = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
}));

export interface Props {
  isFlippedVertical: boolean;
  isFlippedHorizontal: boolean;
  onSetIsFlippedVertical: (value: boolean) => void;
  onSetIsFlippedHorizontal: (value: boolean) => void;
}

export default function FlipButtonElements({
  isFlippedVertical,
  isFlippedHorizontal,
  onSetIsFlippedVertical,
  onSetIsFlippedHorizontal,
}: Props) {
  const {
    icon: iconColor,
    iconSelected: iconSelectedColor,
  } = useTheme().colors;

  const handleSetIsFlippedVertical = useCallback(
    () => onSetIsFlippedVertical(!isFlippedVertical),
    [isFlippedVertical, onSetIsFlippedVertical],
  );

  const handleSetIsFlippedHorizontal = useCallback(
    () => onSetIsFlippedHorizontal(!isFlippedHorizontal),
    [isFlippedHorizontal, onSetIsFlippedHorizontal],
  );

  return (
    <FlipButtonContainer>
      <Button
        id="flip-horizontal"
        tooltip="Flip horizontally"
        onClick={handleSetIsFlippedHorizontal}
        active={isFlippedHorizontal}
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
      >
        <FlipVerticalIcon
          color={isFlippedVertical ? iconSelectedColor : iconColor}
        />
      </Button>
    </FlipButtonContainer>
  );
}
