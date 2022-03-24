import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react';

import type {
  ExpandableContextType,
  ActiveTabs,
  ExpandablePosition,
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

export const ExpandableContextProvider = ({
  children,
}: PropsWithChildren<{}>) => {
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

  return (
    <ExpandableContext.Provider value={{ activeTabs, setActiveTab }}>
      {children}
    </ExpandableContext.Provider>
  );
};
