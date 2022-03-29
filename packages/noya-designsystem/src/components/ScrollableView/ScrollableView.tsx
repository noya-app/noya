import React, { memo } from 'react';

import type { ScrollableContextType, ScrollableViewProps } from './types';

export function useScrollable(): ScrollableContextType {
  return {
    isAvailable: false,
    scrollEnabled: false,
    setScrollEnabled: () => {},
  };
}

export const ScrollableView = memo(function ScrollableView({
  children,
  ...restProps
}: ScrollableViewProps) {
  return <div {...restProps}>{children}</div>;
});
