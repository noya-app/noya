import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  ColorInputField,
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

const InputFieldRoot = styled(InputField.Root)`
  flex: 0;
`

interface Props {
  id: string;
  color: Sketch.Color;
  onChangeColor: (color: Sketch.Color) => void;
  onChangeOpacity: (amount: number) => void;
  onNudgeOpacity: (amount: number) => void;
}

export default memo(function ColorSelectRow({
  id,
  color,
  onChangeColor,
  onChangeOpacity,
  onNudgeOpacity,
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
      <InputFieldRoot id={'colorName'}>
          <InputField.Input value={'colorName'} onSubmit={() => {}} />
      </InputFieldRoot>
      <ColorInputField
            id={colorInputId}
            value={color}
            onChange={onChangeColor}
      />
      <Row id={id}>
        <LabeledElementView renderLabel={renderLabel}>
          <Spacer.Vertical size={8} />
          <InputField.Root id={hexInputId} labelPosition="start">
            <InputField.Input value={'FFFFFF'} onSubmit={() => {}} />
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