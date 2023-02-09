import { useDesignSystemTheme } from 'noya-designsystem';
import React, { forwardRef } from 'react';

export const Logo = forwardRef(function Logo(
  props: React.ComponentProps<'svg'>,
  ref: React.Ref<SVGSVGElement>,
) {
  const { fill } = useDesignSystemTheme().colors.logo;

  return (
    <svg
      ref={ref}
      width="24"
      height="26"
      viewBox="0 0 24 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.5 3H2V12H5V6H6.5C7.32843 6 8 6.67157 8 7.5V12H11V7.5C11 5.01472 8.98528 3 6.5 3Z"
        fill={fill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.5 12C19.9853 12 22 9.98528 22 7.5C22 5.01472 19.9853 3 17.5 3C15.0147 3 13 5.01472 13 7.5C13 9.98528 15.0147 12 17.5 12ZM17.5 9C18.3284 9 19 8.32843 19 7.5C19 6.67157 18.3284 6 17.5 6C16.6716 6 16 6.67157 16 7.5C16 8.32843 16.6716 9 17.5 9Z"
        fill={fill}
      />
      <path
        d="M5 14H2V18.5C2 20.9853 4.01472 23 6.5 23H8V26H11V17H8V20H6.5C5.67157 20 5 19.3284 5 18.5V14Z"
        fill={fill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.5 23C15.0147 23 13 20.9853 13 18.5C13 16.0147 15.0147 14 17.5 14C19.9853 14 22 16.0147 22 18.5V23H17.5ZM17.5 20C18.3284 20 19 19.3284 19 18.5C19 17.6716 18.3284 17 17.5 17C16.6716 17 16 17.6716 16 18.5C16 19.3284 16.6716 20 17.5 20Z"
        fill={fill}
      />
    </svg>
  );
});
