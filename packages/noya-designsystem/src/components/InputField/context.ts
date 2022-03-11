import { createContext } from 'react';

import { LabelPosition } from './types';

export const InputFieldContext = createContext<{
  labelPosition: LabelPosition;
  labelSize: number;
  hasLabel: boolean;
  hasDropdown: boolean;
}>({
  labelPosition: 'end',
  labelSize: 6,
  hasLabel: false,
  hasDropdown: false,
});
