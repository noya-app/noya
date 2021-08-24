import * as Icons from '@radix-ui/react-icons';
import Button, { ButtonRootProps } from './Button';

type Props = Omit<ButtonRootProps, 'children' | 'variant' | 'flex'> & {
  iconName: keyof typeof Icons;
  color?: string;
};

export default function IconButton(props: Props) {
  const Icon = Icons[props.iconName];

  return (
    <Button {...props} variant="none">
      <Icon color={props.color} />
    </Button>
  );
}
