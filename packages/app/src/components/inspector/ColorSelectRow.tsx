import { memo, useMemo, useCallback } from 'react';
import type Sketch from '@sketch-hq/sketch-file-format-ts';
import type FileFormat from '@sketch-hq/sketch-file-format-ts';
import {
  Alpha,
  ColorModel,
  ColorPicker,
  equalColorObjects,
  hsvaToRgba,
  Hue,
  RgbaColor,
  rgbaToHsva,
  Saturation,
} from 'noya-colorpicker';
import {
  InputField,
  Label,
  LabeledElementView,
  Spacer,
} from 'noya-designsystem';
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

const FullContent = styled.div(({ theme }) => ({
  borderRadius: 4,
  padding: '10px 0',
  fontSize: 14,
  color: 'black',
}));

const colorModel: ColorModel<RgbaColor> = {
  defaultColor: { r: 0, g: 0, b: 0, a: 1 },
  toHsva: rgbaToHsva,
  fromHsva: hsvaToRgba,
  equal: equalColorObjects,
};

interface ColorInputProps {
  id?: string;
  value: FileFormat.Color;
  onChange: (color: FileFormat.Color) => void;
}

interface Props {
  id: string;
  name: string | undefined;
  color: Sketch.Color;
  hexValue?: string;
  onChangeColor: (color: Sketch.Color) => void;
  onChangeOpacity: (amount: number) => void;
  onNudgeOpacity: (amount: number) => void;
  onInputChange: (value: string) => void;
}

const ColorInputFieldFull = memo(function ColorInputFieldFull({
  id,
  value,
  onChange,
}: ColorInputProps) {
  const rgbaColor: RgbaColor = useMemo(
    () => ({
      r: Math.floor(value.red * 255),
      g: Math.floor(value.green * 255),
      b: Math.floor(value.blue * 255),
      a: value.alpha,
    }),
    [value],
  );

  const handleChange = useCallback(
    (value: RgbaColor) => {
      onChange({
        _class: 'color',
        alpha: value.a,
        red: value.r / 255,
        green: value.g / 255,
        blue: value.b / 255,
      });
    },
    [onChange],
  );

  return (
    <FullContent>
      <ColorPicker
        colorModel={colorModel}
        color={rgbaColor}
        onChange={handleChange}
      >
        <Saturation />
        <Spacer.Vertical size={12} />
        <Hue />
        <Spacer.Vertical size={5} />
        <Alpha />
      </ColorPicker>
    </FullContent>
  );
});

export default memo(function ColorSelectRow({
  id,
  name,
  color,
  hexValue = 'FFFFFF',
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
          placeholder={name || 'Multiple'}
          onChange={onInputChange}
        />
      </InputField.Root>
      <ColorInputFieldFull
        id={colorInputId}
        value={color}
        onChange={onChangeColor}
      />
      <Row id={id}>
        <LabeledElementView renderLabel={renderLabel}>
          <Spacer.Vertical size={8} />
          <InputField.Root id={hexInputId} labelPosition="start">
            <InputField.Input value={hexValue} onSubmit={() => {}} />
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
