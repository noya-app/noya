import { useDeepMemo } from '@noya-app/react-utils';
import React, { ReactNode, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { ColorPickerContextValue, ColorPickerProvider } from '../contexts/ColorPickerContext';
import { AnyColor, ColorModel, ColorPickerBaseProps, HsvaColor } from '../types';

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
  const hsva = useDeepMemo(colorModel.toHsva(color));

  const handleChange = useCallback(
    (params: Partial<HsvaColor>) => {
      onChange?.(colorModel.fromHsva({ ...hsva, ...params }))
    },
    [colorModel, hsva, onChange],
  );

  const contextValue = useMemo((): ColorPickerContextValue => [hsva, handleChange], [handleChange, hsva])

  return (
    <ColorPickerProvider value={contextValue}>
      <Container>{children}</Container>
    </ColorPickerProvider>
  );
}