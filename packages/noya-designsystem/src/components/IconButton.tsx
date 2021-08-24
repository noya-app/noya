import * as Icons from '@radix-ui/react-icons';
import { ForwardedRef, forwardRef, memo } from 'react';
import { useTheme } from 'styled-components';
import Button, { ButtonRootProps } from './Button';

type Props = Omit<ButtonRootProps, 'children' | 'variant' | 'flex'> & {
  iconName: keyof typeof Icons;
  selected?: boolean;
  color?: string;
};

export default memo(
  forwardRef(function IconButton(
    { selected, iconName, color, ...props }: Props,
    forwardedRef: ForwardedRef<HTMLButtonElement>,
  ) {
    const { icon: iconColor, iconSelected: iconSelectedColor } =
      useTheme().colors;

    const Icon = Icons[iconName];

    return (
      <Button ref={forwardedRef} {...props} variant="none">
        <Icon color={color ?? (selected ? iconSelectedColor : iconColor)} />
      </Button>
    );
  }),
);
