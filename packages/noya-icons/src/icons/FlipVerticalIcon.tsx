import { IconProps } from '@radix-ui/react-icons/dist/types';
import { memo } from 'react';

export const FlipVerticalIcon = memo(function FlipVerticalIcon({
  color = 'currentColor',
  ...props
}: IconProps) {
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
        d="M12 8.5L3 8.5C2.72386 8.5 2.5 8.72386 2.5 9L2.5 12C2.5 12.2761 2.72386 12.5 3 12.5L4.36644 12.5C4.42336 12.5 4.47987 12.4903 4.53352 12.4713L12.1671 9.76481C12.3666 9.69406 12.5 9.50528 12.5 9.29355L12.5 9C12.5 8.72386 12.2761 8.5 12 8.5Z"
        fill={color}
        stroke={color}
      />
      <path
        d="M12 6.5L3 6.5C2.72386 6.5 2.5 6.27614 2.5 6L2.5 3C2.5 2.72386 2.72386 2.5 3 2.5L4.36644 2.5C4.42336 2.5 4.47987 2.50972 4.53352 2.52874L12.1671 5.23519C12.3666 5.30594 12.5 5.49472 12.5 5.70645L12.5 6C12.5 6.27614 12.2761 6.5 12 6.5Z"
        stroke={color}
      />
    </svg>
  );
});
