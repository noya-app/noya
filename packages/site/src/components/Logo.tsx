import { useDesignSystemTheme } from 'noya-designsystem';
import React, { forwardRef } from 'react';

export const Logo = forwardRef(function Logo(
  props: React.ComponentProps<'svg'>,
  ref: React.Ref<SVGSVGElement>,
) {
  const { fill, highlight } = useDesignSystemTheme().colors.logo;

  return (
    <svg
      ref={ref}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.5 2H2V11H5V5H6.5C7.32843 5 8 5.67157 8 6.5V11H11V6.5C11 4.01472 8.98528 2 6.5 2Z"
        fill={fill}
      />
      <rect x="2" y="2" width="3" height="3" fill={highlight} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.5 11C19.9853 11 22 8.98528 22 6.5C22 4.01472 19.9853 2 17.5 2C15.0147 2 13 4.01472 13 6.5C13 8.98528 15.0147 11 17.5 11ZM17.5 8C18.3284 8 19 7.32843 19 6.5C19 5.67157 18.3284 5 17.5 5C16.6716 5 16 5.67157 16 6.5C16 7.32843 16.6716 8 17.5 8Z"
        fill={fill}
      />
      <path
        d="M5 13H2V17.5C2 19.9853 4.01472 22 6.5 22H8V24H11V16H8V19H6.5C5.67157 19 5 18.3284 5 17.5V13Z"
        fill={fill}
      />
      <rect x="2" y="13" width="3" height="3" fill={highlight} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.5 22C15.0147 22 13 19.9853 13 17.5C13 15.0147 15.0147 13 17.5 13C19.9853 13 22 15.0147 22 17.5V22H17.5ZM17.5 19C18.3284 19 19 18.3284 19 17.5C19 16.6716 18.3284 16 17.5 16C16.6716 16 16 16.6716 16 17.5C16 18.3284 16.6716 19 17.5 19Z"
        fill={fill}
      />
      <rect x="19" y="19" width="3" height="3" fill={highlight} />
    </svg>
  );
});
