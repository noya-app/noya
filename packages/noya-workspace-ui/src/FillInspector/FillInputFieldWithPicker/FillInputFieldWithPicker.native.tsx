import React, { memo, useMemo } from 'react';

import Sketch from 'noya-file-format';
import { FillInputField } from 'noya-designsystem';
import { FillInputProps } from './types';

export default memo(function FillInputFieldWithPicker({
  id,
  flex,
  fillType,
  onChangeType,
  hasMultipleFills = false,
  colorProps,
  gradientProps,
  patternProps,
  shaderProps,
}: FillInputProps) {
  const value = useMemo(() => {
    switch (fillType) {
      case Sketch.FillType.Gradient:
        return gradientProps?.gradient;
      case Sketch.FillType.Pattern:
        return patternProps?.pattern;
      case Sketch.FillType.Color:
      case undefined:
        return colorProps.color;
    }
  }, [
    fillType,
    colorProps.color,
    gradientProps?.gradient,
    patternProps?.pattern,
  ]);

  return (
    <FillInputField
      id={id}
      flex={flex}
      value={hasMultipleFills ? undefined : value}
    />
  );
});
