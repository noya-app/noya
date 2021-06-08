/* eslint-disable @shopify/prefer-early-return */
import { useState, useEffect, useCallback, useRef } from 'react';
import { ColorModel, AnyColor, HsvaColor } from '../types';
import { equalColorObjects } from '../utils/compare';
import { useEventCallback } from './useEventCallback';

export function useColorManipulation<T extends AnyColor>(
  colorModel: ColorModel<T>,
  color: T,
  onChange?: (color: T, index?: number, position?: number) => void,
): [
  HsvaColor,
  (color: Partial<HsvaColor>, index?: number, position?: number) => void,
  {
    index?: number;
    position?: number;
  },
] {
  // Save onChange callback in the ref for avoiding "useCallback hell"
  const onChangeCallback = useEventCallback<T>(onChange);

  // No matter which color model is used (HEX, RGB(A) or HSL(A)),
  // all internal calculations are based on HSVA model
  const [hsva, updateHsva] = useState<HsvaColor>(() =>
    colorModel.toHsva(color),
  );

  //In the case of selected Gradient, remember here the index of the currently selected gradient.
  const [selectedGradient, updateSelectedGradient] = useState<{
    index?: number;
    position?: number;
  }>(() => ({ index: undefined, position: undefined }));

  // By using this ref we're able to prevent extra updates
  // and the effects recursion during the color conversion
  const cache = useRef({ color, hsva, selectedGradient });

  // Update local HSVA-value if `color` property value is changed,
  // but only if that's not the same color that we just sent to the parent
  useEffect(() => {
    if (!colorModel.equal(color, cache.current.color)) {
      const newHsva = colorModel.toHsva(color);
      cache.current = { hsva: newHsva, color, selectedGradient };
      updateHsva(newHsva);
    }
  }, [color, colorModel, selectedGradient]);

  // Trigger `onChange` callback only if an updated color is different from cached one;
  // save the new color to the ref to prevent unnecessary updates
  useEffect(() => {
    let newColor;
    if (
      !equalColorObjects(hsva, cache.current.hsva) &&
      !colorModel.equal(
        (newColor = colorModel.fromHsva(hsva)),
        cache.current.color,
      )
    ) {
      cache.current = { hsva, color: newColor, selectedGradient };
      onChangeCallback(
        newColor,
        selectedGradient.index,
        selectedGradient.position,
      );
    }
  }, [hsva, colorModel, selectedGradient, onChangeCallback]);

  // Merge the current HSVA color object with updated params.
  // For example, when a child component sends `h` or `s` only
  const handleChange = useCallback(
    (params: Partial<HsvaColor>, index?: number, position?: number) => {
      if (index !== undefined) updateSelectedGradient({ index, position });
      updateHsva((current) => Object.assign({}, current, params));
    },
    [],
  );

  return [hsva, handleChange, selectedGradient];
}
