import * as Popover from '@radix-ui/react-popover';
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
} from 'ayano-colorpicker';
import { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import * as Spacer from '../components/Spacer';

const Trigger = styled(Popover.Trigger)(({ color }) => ({
  width: '60px',
  height: '27px',
  borderRadius: '4px',
  border: '1px solid rgba(0,0,0,0.1)',
  backgroundColor: color,
}));

const StyledContent = styled(Popover.Content)({
  width: '240px',
  borderRadius: 4,
  padding: '10px',
  fontSize: 14,
  backgroundColor: 'white',
  color: 'black',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
});

const StyledArrow = styled(Popover.Arrow)({
  fill: 'white',
});

const colorModel: ColorModel<RgbaColor> = {
  defaultColor: { r: 0, g: 0, b: 0, a: 1 },
  toHsva: rgbaToHsva,
  fromHsva: hsvaToRgba,
  equal: equalColorObjects,
};

interface Props {
  id?: string;
  color: FileFormat.Color;
  onChange: (color: FileFormat.Color) => void;
}

export default function ColorInputField({ id, color, onChange }: Props) {
  const colorString = `rgba(${color.red * 255}, ${color.green * 255}, ${
    color.blue * 255
  }, ${color.alpha})`;

  const rgbaColor: RgbaColor = useMemo(
    () => ({
      r: Math.floor(color.red * 255),
      g: Math.floor(color.green * 255),
      b: Math.floor(color.blue * 255),
      a: color.alpha,
    }),
    [color],
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
    <Popover.Root>
      <Trigger color={colorString} id={id} />
      <StyledContent>
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
        <StyledArrow />
      </StyledContent>
    </Popover.Root>
  );
}
