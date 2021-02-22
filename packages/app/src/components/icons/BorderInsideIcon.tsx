import { IconProps } from '@radix-ui/react-icons/dist/types';

const BorderInsideIcon = ({ color = 'currentColor', ...props }: IconProps) => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="1.5" y="1.5" width="2" height="2" stroke={color} />
      <rect x="1.5" y="11.5" width="2" height="2" stroke={color} />
      <rect x="11.5" y="11.5" width="2" height="2" stroke={color} />
      <rect x="11.5" y="1.5" width="2" height="2" stroke={color} />
      <rect x="3.5" y="3.5" width="8" height="8" stroke={color} />
    </svg>
  );
};

export default BorderInsideIcon;
