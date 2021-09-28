import { IconProps } from '@radix-ui/react-icons/dist/types';
import { memo } from 'react';

export const PaintBucketIcon = memo(function ({
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
        d="M6.52002 2.1967L11.4698 7.14645L6.87357 11.7426C6.28779 12.3284 5.33804 12.3284 4.75225 11.7426L1.92383 8.91421C1.33804 8.32843 1.33804 7.37868 1.92383 6.79289L6.52002 2.1967Z"
        stroke={color}
      />
      <path
        d="M12.035 7C10.785 8.14583 10.16 9.08333 10.16 10.125C10.16 11.1605 10.9995 12 12.035 12C13.0706 12 13.91 11.1605 13.91 10.125C13.91 9.08333 13.285 8.14583 12.035 7ZM12.91 10.125C12.91 9.66146 12.704 9.1434 12.035 8.40846C11.3661 9.1434 11.16 9.66146 11.16 10.125C11.16 10.6082 11.5518 11 12.035 11C12.5183 11 12.91 10.6082 12.91 10.125Z"
        fill={color}
      />
    </svg>
  );
});
