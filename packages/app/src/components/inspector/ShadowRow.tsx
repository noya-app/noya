import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { Label, LabeledElementView, Spacer } from 'noya-designsystem';
import { SetNumberMode } from 'noya-state';
import { memo, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import DimensionInput from './DimensionInput';
import { DimensionValue } from './DimensionsInspector';
import FillInputFieldWithPicker from './FillInputFieldWithPicker';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

interface Props {
  id: string;
  color?: Sketch.Color;
  x: DimensionValue;
  y: DimensionValue;
  blur: DimensionValue;
  spread: DimensionValue;
  onChangeColor: (color: Sketch.Color) => void;
  onSetX: (value: number, mode: SetNumberMode) => void;
  onSetY: (value: number, mode: SetNumberMode) => void;
  onSetBlur: (value: number, mode: SetNumberMode) => void;
  onSetSpread: (value: number, mode: SetNumberMode) => void;
  prefix?: ReactNode;
}

export default memo(function FillRow({
  id,
  color,
  x,
  y,
  blur,
  spread,
  onChangeColor,
  onSetX,
  onSetY,
  onSetBlur,
  onSetSpread,
  prefix,
}: Props) {
  const colorInputId = `${id}-color`;
  const xInputId = `${id}-x`;
  const yInputId = `${id}-y`;
  const blurInputId = `${id}-blur`;
  const spreadInputId = `${id}-spread`;

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case colorInputId:
          return <Label.Label>Color</Label.Label>;
        case xInputId:
          return <Label.Label>X</Label.Label>;
        case yInputId:
          return <Label.Label>Y</Label.Label>;
        case blurInputId:
          return <Label.Label>Blur</Label.Label>;
        case spreadInputId:
          return <Label.Label>Spread</Label.Label>;
        default:
          return null;
      }
    },
    [colorInputId, xInputId, yInputId, blurInputId, spreadInputId],
  );

  return (
    <Row id={id}>
      <LabeledElementView renderLabel={renderLabel}>
        {prefix}
        {prefix && <Spacer.Horizontal size={8} />}
        <FillInputFieldWithPicker
          id={colorInputId}
          value={
            color ?? { _class: 'color', alpha: 0, red: 0, green: 0, blue: 1 }
          }
          onChange={onChangeColor}
        />
        <Spacer.Horizontal size={8} />
        <DimensionInput
          id={xInputId}
          size={50}
          value={x !== undefined ? Math.round(x) : x}
          onSetValue={onSetX}
        />
        <Spacer.Horizontal size={8} />
        <DimensionInput
          id={yInputId}
          size={50}
          value={y !== undefined ? Math.round(y) : y}
          onSetValue={onSetY}
        />
        <Spacer.Horizontal size={8} />
        <DimensionInput
          id={blurInputId}
          size={50}
          value={blur !== undefined ? Math.round(blur) : blur}
          onSetValue={onSetBlur}
        />
        <Spacer.Horizontal size={8} />
        <DimensionInput
          id={spreadInputId}
          size={50}
          value={spread !== undefined ? Math.round(spread) : spread}
          onSetValue={onSetSpread}
        />
      </LabeledElementView>
    </Row>
  );
});
