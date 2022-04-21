import React, {
  memo,
  useState,
  useContext,
  useCallback,
  createContext,
  PropsWithChildren,
  useMemo,
} from 'react';

import type {
  ActiveTabs,
  ExpandablePosition,
  ExpandableContextType,
} from './types';

export const ExpandableContext = createContext<ExpandableContextType>({
  activeTabs: {},
  setActiveTab: () => {},
});

export function useExpandable(): ExpandableContextType {
  const value = useContext(ExpandableContext);

  if (!value) {
    // Return placeholder values for platforms that don't use expandable
    return { setActiveTab: () => {}, activeTabs: {} };
  }

  return value;
}

export const ExpandableProvider = memo(function ExpandableProvider({
  children,
}: PropsWithChildren<{}>) {
  const [activeTabs, setActiveTabs] = useState<ActiveTabs>({});

  const setActiveTab = useCallback(
    (position: ExpandablePosition, tab?: string) => {
      setActiveTabs({
        ...activeTabs,
        [position]: tab,
      });
    },
    [activeTabs],
  );

  const value = useMemo(
    () => ({ activeTabs, setActiveTab }),
    [activeTabs, setActiveTab],
  );

  return (
    <ExpandableContext.Provider value={value}>
      {children}
    </ExpandableContext.Provider>
  );
});
