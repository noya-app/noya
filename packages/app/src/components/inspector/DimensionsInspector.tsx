import { Button, InputField, Spacer } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import FlipHorizontalIcon from '../icons/FlipHorizontalIcon';
import FlipVerticalIcon from '../icons/FlipVerticalIcon';

export type DimensionValue = number | undefined;

export interface Props {
  x: DimensionValue;
  y: DimensionValue;
  width: DimensionValue;
  height: DimensionValue;
  rotation: DimensionValue;
  onSetX: (value: number, mode: SetNumberMode) => void;
  onSetY: (value: number, mode: SetNumberMode) => void;
  onSetWidth: (value: number, mode: SetNumberMode) => void;
  onSetHeight: (value: number, mode: SetNumberMode) => void;
  onSetRotation: (value: number, mode: SetNumberMode) => void;
}

const Row = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  paddingLeft: '10px',
  paddingRight: '10px',
}));

const FlipButtonContainer = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
}));

const DimensionInput = memo(function InputX({
  value,
  onSetValue,
  label,
}: {
  value: DimensionValue;
  onSetValue: (value: number, mode: SetNumberMode) => void;
  label: string;
}) {
  const handleNudgeValue = useCallback(
    (value: number) => onSetValue(value, 'adjust'),
    [onSetValue],
  );

  const handleSetValue = useCallback((value) => onSetValue(value, 'replace'), [
    onSetValue,
  ]);

  return (
    <InputField.Root>
      <InputField.NumberInput
        value={value}
        placeholder={value === undefined ? 'multi' : undefined}
        onNudge={handleNudgeValue}
        onSubmit={handleSetValue}
      />
      <InputField.Label>{label}</InputField.Label>
    </InputField.Root>
  );
});

export default function DimensionsInspector({
  x,
  y,
  width,
  height,
  rotation,
  onSetX,
  onSetY,
  onSetWidth,
  onSetHeight,
  onSetRotation,
}: Props) {
  const iconColor = useTheme().colors.icon;

  const flipButtonElements = useMemo(
    () => (
      <FlipButtonContainer>
        <Button id="flip-horizontal" tooltip="Flip horizontally">
          <FlipHorizontalIcon color={iconColor} />
        </Button>
        <Spacer.Horizontal />
        <Button id="flip-vertical" tooltip="Flip vertically">
          <FlipVerticalIcon color={iconColor} />
        </Button>
      </FlipButtonContainer>
    ),
    [iconColor],
  );

  return (
    <>
      <Row>
        <DimensionInput value={x} onSetValue={onSetX} label="X" />
        <Spacer.Horizontal size={16} />
        <DimensionInput value={y} onSetValue={onSetY} label="Y" />
        <Spacer.Horizontal size={16} />
        <DimensionInput value={rotation} onSetValue={onSetRotation} label="°" />
      </Row>
      <Spacer.Vertical size={10} />
      <Row>
        <DimensionInput value={width} onSetValue={onSetWidth} label="W" />
        <Spacer.Horizontal size={16} />
        <DimensionInput value={width} onSetValue={onSetHeight} label="H" />
        <Spacer.Horizontal size={16} />
        {flipButtonElements}
      </Row>
    </>
  );
}
