import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  ColorPicker,
  InputField,
  Label,
  LabeledElementView,
  Spacer,
} from 'noya-designsystem';
import { memo, useCallback } from 'react';
import styled from 'styled-components';

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

const Column = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
}));

interface Props {
  id: string;
  name: string | undefined;
  hexValue: string | undefined;
  color: Sketch.Color;
  onChangeColor: (color: Sketch.Color) => void;
  onChangeOpacity: (amount: number) => void;
  onNudgeOpacity: (amount: number) => void;
  onInputChange: (value: string) => void;
}

export default memo(function ColorInspector({
  id,
  name,
  color,
  hexValue,
  onChangeColor,
  onChangeOpacity,
  onNudgeOpacity,
  onInputChange,
}: Props) {
  const colorInputId = `${id}-color`;
  const hexInputId = `${id}-hex`;
  const opacityInputId = `${id}-opacity`;

  const renderLabel = useCallback(
    ({ id }) => {
      switch (id) {
        case colorInputId:
          return <Label.Label>Color</Label.Label>;
        case hexInputId:
          return <Label.Label>Hex</Label.Label>;
        case opacityInputId:
          return <Label.Label>Opacity</Label.Label>;
        default:
          return null;
      }
    },
    [colorInputId, hexInputId, opacityInputId],
  );

  const handleSubmitOpacity = useCallback(
    (opacity: number) => {
      onChangeOpacity(opacity / 100);
    },
    [onChangeOpacity],
  );

  const handleNudgeOpacity = useCallback(
    (amount: number) => {
      onNudgeOpacity(amount / 100);
    },
    [onNudgeOpacity],
  );

  return (
    <Column>
      <InputField.Root id={'colorName'}>
        <InputField.Input
          value={name || ''}
          placeholder={name === undefined ? 'Multiple' : 'Color name'}
          onChange={onInputChange}
        />
      </InputField.Root>
      <Spacer.Vertical size={10} />
      <ColorPicker value={color} onChange={onChangeColor} />
      <Spacer.Vertical size={10} />
      <Row id={id}>
        <LabeledElementView renderLabel={renderLabel}>
          <Spacer.Vertical size={8} />
          <InputField.Root id={hexInputId} labelPosition="start">
            <InputField.Input
              value={hexValue ?? ''}
              placeholder={hexValue ? '' : 'Multiple'}
              onSubmit={() => {}}
            />
            <InputField.Label>#</InputField.Label>
          </InputField.Root>
          <Spacer.Horizontal size={8} />
          <InputField.Root id={opacityInputId} size={50}>
            <InputField.NumberInput
              value={Math.round(color.alpha * 100)}
              onSubmit={handleSubmitOpacity}
              onNudge={handleNudgeOpacity}
            />
            <InputField.Label>%</InputField.Label>
          </InputField.Root>
        </LabeledElementView>
      </Row>
    </Column>
  );
});
