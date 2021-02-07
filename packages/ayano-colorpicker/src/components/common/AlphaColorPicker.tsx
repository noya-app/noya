import React from 'react';

import { Hue } from './Hue';
import { Saturation } from './Saturation';
import { Alpha } from './Alpha';

import { ColorModel, ColorPickerBaseProps, AnyColor } from '../../types';
import { useColorManipulation } from '../../hooks/useColorManipulation';

import styled from 'styled-components';

const Container = styled.div({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  width: '200px',
  height: '200px',
  userSelect: 'none',
  cursor: 'default',
});

interface Props<T extends AnyColor> extends Partial<ColorPickerBaseProps<T>> {
  colorModel: ColorModel<T>;
}

export const AlphaColorPicker = <T extends AnyColor>({
  colorModel,
  color = colorModel.defaultColor,
  onChange,
}: Props<T>): JSX.Element => {
  const [hsva, updateHsva] = useColorManipulation<T>(
    colorModel,
    color,
    onChange,
  );

  return (
    <Container>
      <Saturation hsva={hsva} onChange={updateHsva} />
      <Hue hue={hsva.h} onChange={updateHsva} />
      <Alpha hsva={hsva} onChange={updateHsva} />
    </Container>
  );
};
