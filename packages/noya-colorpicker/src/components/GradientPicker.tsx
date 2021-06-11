import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { GradientPickerProvider } from '../contexts/GradientPickerContext';
import { useGradientManipulation } from '../hooks/useGradientManipulation';
import { AnyColor, ColorModel, GradientPickerBaseProps } from '../types';

const Container = styled.div({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  userSelect: 'none',
  cursor: 'default',
});

interface Props<T extends AnyColor>
  extends Partial<GradientPickerBaseProps<T>> {
  colorModel: ColorModel<T>;
  children?: ReactNode;
}

export default function ColorPicker<T extends AnyColor>({
  colorModel,
  color = colorModel.defaultColor,
  onChangeColor,
  onChangePosition,
  onAdd,
  children,
}: Props<T>): JSX.Element {
  const contextValue = useGradientManipulation<T>(
    colorModel,
    color,
    onChangeColor,
    onChangePosition,
    onAdd,
  );

  return (
    <GradientPickerProvider value={contextValue}>
      <Container>{children}</Container>
    </GradientPickerProvider>
  );
}
