import React, { memo } from 'react';

import { ButtonProps } from './types';

const ButtonComponent: React.FC<ButtonProps> = (props) => {
  throw new Error('Button.tsx not implemented!');
};

export const Button = memo(ButtonComponent);
