import { IconProps } from '@radix-ui/react-icons/dist/types';

const LineIcon = ({ color = 'currentColor', ...props }: IconProps) => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="1.5" y="9.5" width="4" height="4" rx="2" stroke={color} />
      <rect x="9.5" y="1.5" width="4" height="4" rx="2" stroke={color} />
      <rect
        x="4.67157"
        y="9.62132"
        width="7"
        height="1"
        transform="rotate(-45 4.67157 9.62132)"
        fill={color}
      />
    </svg>
  );
};

export default LineIcon;
