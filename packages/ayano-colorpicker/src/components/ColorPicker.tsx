import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { ColorPickerProvider } from '../contexts/ColorPickerContext';
import { useColorManipulation } from '../hooks/useColorManipulation';
import { AnyColor, ColorModel, ColorPickerBaseProps } from '../types';

const Container = styled.div({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  userSelect: 'none',
  cursor: 'default',
});

interface Props<T extends AnyColor> extends Partial<ColorPickerBaseProps<T>> {
  colorModel: ColorModel<T>;
  children?: ReactNode;
}

export default function ColorPicker<T extends AnyColor>({
  colorModel,
  color = colorModel.defaultColor,
  onChange,
  children,
}: Props<T>): JSX.Element {
  const contextValue = useColorManipulation<T>(colorModel, color, onChange);

  return (
    <ColorPickerProvider value={contextValue}>
      <Container>{children}</Container>
    </ColorPickerProvider>
  );
}
