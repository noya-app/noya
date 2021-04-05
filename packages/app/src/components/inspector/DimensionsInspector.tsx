import { Button, InputField, Spacer } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import FlipHorizontalIcon from '../icons/FlipHorizontalIcon';
import FlipVerticalIcon from '../icons/FlipVerticalIcon';

export type DimensionValue = number | undefined;

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

export interface Props {
  x: DimensionValue;
  y: DimensionValue;
  width: DimensionValue;
  height: DimensionValue;
  rotation: DimensionValue;
  onSetRotation: (value: number, mode: SetNumberMode) => void;
}

export default function DimensionsInspector({
  x,
  y,
  width,
  height,
  rotation,
  onSetRotation,
}: Props) {
  const iconColor = useTheme().colors.icon;

  return (
    <>
      <Row>
        <InputField.Root>
          <InputField.NumberInput
            value={x}
            placeholder={x === undefined ? 'multi' : undefined}
            onSubmit={() => {}}
          />
          <InputField.Label>X</InputField.Label>
        </InputField.Root>
        <Spacer.Horizontal size={16} />
        <InputField.Root>
          <InputField.NumberInput
            value={y}
            placeholder={y === undefined ? 'multi' : undefined}
            onSubmit={() => {}}
          />
          <InputField.Label>Y</InputField.Label>
        </InputField.Root>
        <Spacer.Horizontal size={16} />
        <InputField.Root>
          <InputField.NumberInput
            value={rotation}
            placeholder={rotation === undefined ? 'multi' : undefined}
            onNudge={useCallback(
              (value: number) => {
                onSetRotation(value, 'adjust');
              },
              [onSetRotation],
            )}
            onSubmit={useCallback(
              (value) => {
                onSetRotation(value, 'replace');
              },
              [onSetRotation],
            )}
          />
          <InputField.Label>°</InputField.Label>
        </InputField.Root>
      </Row>
      <Spacer.Vertical size={10} />
      <Row>
        <InputField.Root>
          <InputField.NumberInput
            value={width}
            placeholder={width === undefined ? 'multi' : undefined}
            onSubmit={() => {}}
          />
          <InputField.Label>W</InputField.Label>
        </InputField.Root>
        <Spacer.Horizontal size={16} />
        <InputField.Root>
          <InputField.NumberInput
            value={height}
            placeholder={height === undefined ? 'multi' : undefined}
            onSubmit={() => {}}
          />
          <InputField.Label>H</InputField.Label>
        </InputField.Root>
        <Spacer.Horizontal size={16} />
        <FlipButtonContainer>
          <Button
            id="flip-horizontal"
            tooltip="Flip horizontally"
            onClick={useCallback(() => {}, [])}
          >
            <FlipHorizontalIcon color={iconColor} />
          </Button>
          <Spacer.Horizontal />
          <Button
            id="flip-vertical"
            tooltip="Flip vertically"
            onClick={useCallback(() => {}, [])}
          >
            <FlipVerticalIcon color={iconColor} />
          </Button>
        </FlipButtonContainer>
      </Row>
    </>
  );
}
