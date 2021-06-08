import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  ColorPicker,
  InputField,
  Label,
  LabeledElementView,
  sketchColorToHex,
  Spacer,
} from 'noya-designsystem';
import { clamp } from 'noya-utils';
import { memo, useCallback, useMemo } from 'react';
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
  colors: Sketch.Color[];
  gradient?: Sketch.Gradient;
  /**
   * The only required change handler is `onChangeColor`. However, to handle
   * more granular changes specially, e.g. nudging opacity, you can pass other
   * handlers.
   */
  onChangeColor: (color: Sketch.Color) => void;
  onChangeOpacity?: (amount: number) => void;
  onNudgeOpacity?: (amount: number) => void;
  onChangeGradientColor?: (
    color: Sketch.Color,
    index: number,
    position: number,
  ) => void;
}

export default memo(function ColorInspector({
  id,
  colors,
  gradient,
  onChangeColor,
  onChangeOpacity,
  onNudgeOpacity,
  onChangeGradientColor = (
    color: Sketch.Color,
    index: number,
    position: number,
  ) => {},
}: Props) {
  const colorInputId = `${id}-color`;
  const hexInputId = `${id}-hex`;
  const opacityInputId = `${id}-opacity`;

  const firstColor = colors[0];
  const firstColorHex = sketchColorToHex(firstColor);
  const hexValue = useMemo(
    () =>
      colors.length > 1 &&
      !colors.every((v) => sketchColorToHex(v) === firstColorHex)
        ? undefined
        : firstColorHex.slice(1),
    [firstColorHex, colors],
  );

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
      if (onChangeOpacity) {
        onChangeOpacity(opacity / 100);
      } else {
        onChangeColor({
          ...firstColor,
          alpha: clamp(opacity / 100, 0, 1),
        });
      }
    },
    [onChangeOpacity, onChangeColor, firstColor],
  );

  const handleNudgeOpacity = useCallback(
    (amount: number) => {
      if (onNudgeOpacity) {
        onNudgeOpacity(amount / 100);
      } else {
        onChangeColor({
          ...firstColor,
          alpha: clamp(firstColor.alpha + amount / 100, 0, 1),
        });
      }
    },
    [firstColor, onChangeColor, onNudgeOpacity],
  );

  return (
    <Column>
      <ColorPicker
        value={firstColor}
        gradients={gradient ? gradient.stops : undefined}
        onChange={gradient ? onChangeGradientColor : onChangeColor}
      />
      <Spacer.Vertical size={10} />
      <Row id={id}>
        <LabeledElementView renderLabel={renderLabel}>
          <Spacer.Vertical size={8} />
          <InputField.Root id={hexInputId} labelPosition="start">
            <InputField.Input
              value={hexValue ?? ''}
              placeholder={hexValue ? '' : 'Multiple'}
              onSubmit={useCallback(() => {}, [])}
            />
            <InputField.Label>#</InputField.Label>
          </InputField.Root>
          <Spacer.Horizontal size={8} />
          <InputField.Root id={opacityInputId} size={50}>
            <InputField.NumberInput
              value={Math.round(firstColor.alpha * 100)}
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
