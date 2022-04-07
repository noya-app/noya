import React, { ReactNode } from 'react';

import { ColorPickerProvider } from '../contexts/ColorPickerContext';
import { useColorManipulation } from '../hooks/useColorManipulation';
import { AnyColor, ColorModel, ColorPickerBaseProps } from '../types';
import Container from './Container';

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
