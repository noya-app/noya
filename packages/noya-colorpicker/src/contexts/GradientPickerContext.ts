import { createContext, useContext } from 'react';
import { HsvaColor } from '../types';

type GradientPickerContextValue = [
  hsva: HsvaColor,
  onChange: (
    color: Partial<HsvaColor>,
    index?: number,
    position?: number,
  ) => void,
  selectedStop: {
    index?: number;
    position: number;
  },
];

const GradientPickerContext = createContext<
  GradientPickerContextValue | undefined
>(undefined);

export const GradientPickerProvider = GradientPickerContext.Provider;

export function useGradientPicker(): GradientPickerContextValue {
  const value = useContext(GradientPickerContext);

  if (!value) {
    throw new Error('Missing GradientPickerContext');
  }

  return value;
}
