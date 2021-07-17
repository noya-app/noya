import { Spacer } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import styled from 'styled-components';
import DimensionInput from './DimensionInput';
import FlipControls from './FlipControls';

export type DimensionValue = number | undefined;

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
  onSetX: (value: number, mode: SetNumberMode) => void;
  onSetY: (value: number, mode: SetNumberMode) => void;
  onSetWidth: (value: number, mode: SetNumberMode) => void;
  onSetHeight: (value: number, mode: SetNumberMode) => void;
  onSetRotation: (value: number, mode: SetNumberMode) => void;
  onSetIsFlippedVertical: (value: boolean) => void;
  onSetIsFlippedHorizontal: (value: boolean) => void;
}

export default function DimensionsInspector({
  x,
  y,
  width,
  height,
  rotation,
  isFlippedVertical,
  isFlippedHorizontal,
  onSetX,
  onSetY,
  onSetWidth,
  onSetHeight,
  onSetRotation,
  onSetIsFlippedVertical,
  onSetIsFlippedHorizontal,
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
      <Spacer.Vertical size={10} />
      <Row>
        <DimensionInput value={width} onSetValue={onSetWidth} label="W" />
        <Spacer.Horizontal size={16} />
        <DimensionInput value={height} onSetValue={onSetHeight} label="H" />
        <Spacer.Horizontal size={16} />
        <FlipControls
          isFlippedVertical={isFlippedVertical}
          isFlippedHorizontal={isFlippedHorizontal}
          onSetIsFlippedVertical={onSetIsFlippedVertical}
          onSetIsFlippedHorizontal={onSetIsFlippedHorizontal}
        />
      </Row>
    </>
  );
}
