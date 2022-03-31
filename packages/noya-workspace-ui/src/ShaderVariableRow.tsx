import React, { memo } from 'react';

import Sketch from 'noya-file-format';

interface ValueProps {
  id?: string;
  value: Sketch.ShaderVariable['value'];
  onChange: (value: Sketch.ShaderVariable['value']) => void;
  onNudge: (amount: number) => void;
  flex?: string;
}

// const SHADER_VARIABLE_TYPES: Sketch.ShaderVariable['value']['type'][] = [
//   'integer',
//   'float',
//   'color',
// ];

export const ShaderVariableValueInput = memo(function ShaderVariableValueInput(
  props: ValueProps,
) {
  return null;
});
