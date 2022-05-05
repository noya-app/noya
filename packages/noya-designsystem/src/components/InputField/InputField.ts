import { memo } from 'react';

import InputFieldNumberInput from './InputFieldNumberInput';
import InputFieldLabel from './InputFieldLabel';
import InputFieldInput from './InputFieldInput';
import InputFieldRoot from './InputFieldRoot';
import InputFieldDropdownMenu from './InputFieldDropdownMenu';

export const InputField = {
  Root: InputFieldRoot,
  Label: InputFieldLabel,
  Input: memo(InputFieldInput),
  NumberInput: InputFieldNumberInput,
  DropdownMenu: InputFieldDropdownMenu,
};
