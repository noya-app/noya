import * as Icons from '@noya-app/noya-icons';
import React, {
  CSSProperties,
  ForwardedRef,
  forwardRef,
  memo,
  useMemo,
} from 'react';
import { useTheme } from 'styled-components';
import { Button, ButtonRootProps } from './Button';

type Props = Omit<ButtonRootProps, 'children' | 'variant' | 'flex' | 'size'> & {
  iconName: keyof typeof Icons;
  selected?: boolean;
  color?: string;
  size?: number;
};

export const IconButton = memo(
  forwardRef(function IconButton(
    { selected, iconName, color, size, contentStyle, ...props }: Props,
    forwardedRef: ForwardedRef<HTMLButtonElement>,
  ) {
    const { icon: iconColor, iconSelected: iconSelectedColor } =
      useTheme().colors;

    const Icon = Icons[iconName];

    const style = useMemo((): CSSProperties => {
      return {
        padding: '0 2px',
        ...(size && { minHeight: size }),
        ...contentStyle,
      };
    }, [contentStyle, size]);

    return (
      <Button ref={forwardedRef} {...props} variant="none" contentStyle={style}>
        <Icon
          color={color ?? (selected ? iconSelectedColor : iconColor)}
          {...(size && { width: size, height: size })}
        />
      </Button>
    );
  }),
);
