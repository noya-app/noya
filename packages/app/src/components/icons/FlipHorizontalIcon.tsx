import { IconProps } from '@radix-ui/react-icons/dist/types';

const FlipHorizontalIcon = ({
  color = 'currentColor',
  ...props
}: IconProps) => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8.5 3V12C8.5 12.2761 8.72386 12.5 9 12.5H12C12.2761 12.5 12.5 12.2761 12.5 12V10.6336C12.5 10.5766 12.4903 10.5201 12.4713 10.4665L9.76481 2.83292C9.69406 2.63336 9.50528 2.5 9.29355 2.5H9C8.72386 2.5 8.5 2.72386 8.5 3Z"
        fill={color}
        stroke={color}
      />
      <path
        d="M6.5 3V12C6.5 12.2761 6.27614 12.5 6 12.5H3C2.72386 12.5 2.5 12.2761 2.5 12V10.6336C2.5 10.5766 2.50972 10.5201 2.52874 10.4665L5.23519 2.83292C5.30594 2.63336 5.49472 2.5 5.70645 2.5H6C6.27614 2.5 6.5 2.72386 6.5 3Z"
        stroke={color}
      />
    </svg>
  );
};

export default FlipHorizontalIcon;
