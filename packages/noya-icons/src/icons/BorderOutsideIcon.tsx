import { IconProps } from '@radix-ui/react-icons/dist/types';
import React, { memo } from 'react';

export const BorderOutsideIcon = memo(function BorderOutsideIcon({
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
        d="M2.5 1.5H3.5V3.5H1.5V2.5C1.5 1.94772 1.94772 1.5 2.5 1.5Z"
        stroke={color}
      />
      <path
        d="M1.5 11.5H3.5V13.5H2.5C1.94772 13.5 1.5 13.0523 1.5 12.5V11.5Z"
        stroke={color}
      />
      <path
        d="M11.5 11.5H13.5V12.5C13.5 13.0523 13.0523 13.5 12.5 13.5H11.5V11.5Z"
        stroke={color}
      />
      <path
        d="M11.5 1.5H12.5C13.0523 1.5 13.5 1.94772 13.5 2.5V3.5H11.5V1.5Z"
        stroke={color}
      />
      <rect x="1.5" y="1.5" width="12" height="12" rx="1" stroke={color} />
    </svg>
  );
});
