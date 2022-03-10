import React, { memo, forwardRef } from 'react';

import type { IconButtonProps } from './types';
import { Layout } from '../Layout';
import { Button } from './Button';

export const IconButton = memo(
  forwardRef(function IconButton(
    { selected, name, color, size, variant, ...props }: IconButtonProps,
    ref: any,
  ) {
    return (
      <Button ref={ref} variant={variant ?? 'none'} {...props}>
        <Layout.Icon
          name={name}
          color={color}
          selected={selected}
          size={size ?? 16}
        />
      </Button>
    );
  }),
);
