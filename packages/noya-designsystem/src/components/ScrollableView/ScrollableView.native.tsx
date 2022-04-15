import React, { memo, createContext, useContext, useState } from 'react';
import { ScrollView } from 'react-native';

import type { ScrollableContextType, ScrollableViewProps } from './types';

const defaultContext: ScrollableContextType = {
  isAvailable: false,
  scrollEnabled: false,
  setScrollEnabled: () => {},
};

const ScrollableContext = createContext<ScrollableContextType>(defaultContext);

export function useScrollable() {
  const scrollable = useContext(ScrollableContext);

  if (!scrollable) {
    return defaultContext;
  }

  return scrollable;
}

export const ScrollableView = memo(function ScrollableView({
  children,
}: ScrollableViewProps) {
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);

  const scrollable = {
    isAvailable: true,
    scrollEnabled,
    setScrollEnabled,
  };

  return (
    <ScrollableContext.Provider value={scrollable}>
      <ScrollView scrollEnabled={scrollable.scrollEnabled}>
        {children}
      </ScrollView>
    </ScrollableContext.Provider>
  );
});
