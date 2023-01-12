import * as Icons from 'noya-icons';
import React, { ForwardedRef, forwardRef, memo } from 'react';
import { useTheme } from 'styled-components';
import { Button, ButtonRootProps } from './Button';

type Props = Omit<ButtonRootProps, 'children' | 'variant' | 'flex'> & {
  iconName: keyof typeof Icons;
  selected?: boolean;
  color?: string;
  size?: number;
};

export const IconButton = memo(
  forwardRef(function IconButton(
    { selected, iconName, color, size, ...props }: Props,
    forwardedRef: ForwardedRef<HTMLButtonElement>,
  ) {
    const { icon: iconColor, iconSelected: iconSelectedColor } =
      useTheme().colors;

    const Icon = Icons[iconName];

    return (
      <Button ref={forwardedRef} {...props} variant="none">
        <Icon
          color={color ?? (selected ? iconSelectedColor : iconColor)}
          {...(size && { width: size, height: size })}
        />
      </Button>
    );
  }),
);
