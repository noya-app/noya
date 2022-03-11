import { memo } from 'react';

import InputFieldNumberInput from './InputFieldNumberInput';
import InputFieldLabel from './InputFieldLabel';
import InputFieldInput from './InputFieldInput';
import InputFieldRoot from './InputFieldRoot';

export const InputField = {
  NumberInput: InputFieldNumberInput,
  Input: memo(InputFieldInput),
  Label: InputFieldLabel,
  Root: InputFieldRoot,
};
