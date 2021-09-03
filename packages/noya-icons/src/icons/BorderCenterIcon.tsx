import { IconProps } from '@radix-ui/react-icons/dist/types';
import { memo } from 'react';

export const BorderCenterIcon = memo(function ({
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
      <rect x="1.5" y="1.5" width="2" height="2" stroke={color} />
      <rect x="1.5" y="11.5" width="2" height="2" stroke={color} />
      <rect x="11.5" y="11.5" width="2" height="2" stroke={color} />
      <rect x="11.5" y="1.5" width="2" height="2" stroke={color} />
      <path
        d="M3 11.5H2.5V3.5H3H3.5V3V2.5H11.5V3V3.5H12H12.5V11.5H12H11.5V12V12.5H3.5V12V11.5H3Z"
        stroke={color}
      />
    </svg>
  );
});
