import { createContext, useContext } from 'react';
import { HsvaColor } from '../types';

type ColorPickerContextValue = [
  hsva: HsvaColor,
  onChange: (
    color: Partial<HsvaColor>,
    index?: number,
    position?: number,
  ) => void,
  selectedGradient: {
    index?: number;
    position?: number;
  },
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
