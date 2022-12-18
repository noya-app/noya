import { createContext, useContext } from 'react';
import { HsvaColor } from '../types';

export type ColorPickerContextValue = [
  hsva: HsvaColor,
  onChange: (
    color: Partial<HsvaColor>,
  ) => void,
];

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(
  undefined,
);

export const ColorPickerProvider = ColorPickerContext.Provider;

export function useColorPicker(): ColorPickerContextValue {
  const value = useContext(ColorPickerContext);

  if (!value) {
    throw new Error('Missing ColorPickerProvider');
  }

  return value;
}