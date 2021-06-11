/* eslint-disable @shopify/prefer-early-return */
import { useState, useEffect, useCallback, useRef } from 'react';
import { ColorModel, AnyColor, HsvaColor } from '../types';
import { equalColorObjects } from '../utils/compare';
import { useEventCallback } from './useEventCallback';

type GradientIndexPosition = {
  index?: number;
  position: number;
};

export function useGradientManipulation<T extends AnyColor>(
  colorModel: ColorModel<T>,
  color: T,
  onChangeColor?: (color: T, index: number) => void,
  onChangePostion?: (position: number, index: number) => void,
  onAddStop?: (color: T, position: number) => void,
): [
  HsvaColor,
  (color: Partial<HsvaColor>, index?: number, position?: number) => void,
  GradientIndexPosition,
] {
  // Save onChange callback in the ref for avoiding "useCallback hell"
  const onChangeColorCallback = useEventCallback(onChangeColor);
  const onChangePositionCallback = useEventCallback(onChangePostion);
  const onAddStopCallback = useEventCallback(onAddStop);

  // No matter which color model is used (HEX, RGB(A) or HSL(A)),
  // all internal calculations are based on HSVA model
  const [hsva, updateHsva] = useState<HsvaColor>(() =>
    colorModel.toHsva(color),
  );

  //In the case of selected Gradient, remember here the index of the currently selected gradient.
  const [
    selectedGradient,
    updateSelectedGradient,
  ] = useState<GradientIndexPosition>(() => ({
    index: 0,
    position: 0,
  }));

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

  // Trigger `onChangeColor` callback only if an updated color is different from cached one;
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
      if (selectedGradient.index)
        onChangeColorCallback(newColor, selectedGradient.index);
    }
  }, [hsva, colorModel, selectedGradient, onChangeColorCallback]);

  // Trigger `onChangePosition` callback only if an updated color is different from cached one;
  // save the new position to the ref to prevent unnecessary updates
  useEffect(() => {
    cache.current = { hsva, color, selectedGradient };
    if (
      selectedGradient.index !== undefined &&
      selectedGradient.position !== undefined
    )
      onChangePositionCallback(
        selectedGradient.position,
        selectedGradient.index,
      );
  }, [hsva, color, selectedGradient, onChangePositionCallback]);

  // Trigger `onAddStop` callback only if an updated color is different from cached one;
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
      if (selectedGradient.index === undefined)
        onAddStopCallback(newColor, selectedGradient.position);
    }
  }, [hsva, colorModel, selectedGradient, onAddStopCallback]);

  // Merge the current HSVA color object with updated params.
  // For example, when a child component sends `h` or `s` only
  const handleChange = useCallback(
    (params: Partial<HsvaColor>, index?: number, position?: number) => {
      if (
        position !== undefined &&
        (selectedGradient.index !== index ||
          selectedGradient.position !== position)
      )
        updateSelectedGradient({ index, position });

      updateHsva((current) => Object.assign({}, current, params));
    },
    [selectedGradient, updateSelectedGradient, updateHsva],
  );

  return [hsva, handleChange, selectedGradient];
}
