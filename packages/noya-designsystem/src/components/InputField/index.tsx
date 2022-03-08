import { memo } from 'react';

import InputFieldNumberInput from './InputFieldNumberInput';
import InputFieldLabel from './InputFieldLabel';
import InputFieldRoot from './InputFieldRoot';
import InputFieldInput from './InputFieldInput';

export const InputField = {
  Input: memo(InputFieldInput),
  NumberInput: InputFieldNumberInput,
  Label: InputFieldLabel,
  Root: InputFieldRoot,
};
