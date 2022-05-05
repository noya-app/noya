import React, {
  memo,
  useMemo,
  ReactNode,
  useContext,
  createContext,
  PropsWithChildren,
} from 'react';
import { ThemeProvider } from 'styled-components';

import { PlatformName } from 'noya-keymap';
import { Theme } from 'noya-designsystem';

export interface DesignSystemConfigurationContextValue {
  platform: PlatformName;
}

type DesignSystemConfigurationProviderProps = PropsWithChildren<
  DesignSystemConfigurationContextValue & {
    theme: Theme;
    children: ReactNode;
  }
>;

const DesignSystemConfigurationContext = createContext<
  DesignSystemConfigurationContextValue | undefined
>(undefined);

export const DesignSystemConfigurationProvider = memo(
  function DesignSystemConfigurationProvider({
    children,
    theme,
    platform,
  }: DesignSystemConfigurationProviderProps) {
    const value = useMemo(
      () => ({
        platform,
      }),
      [platform],
    );

    return (
      <DesignSystemConfigurationContext.Provider value={value}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </DesignSystemConfigurationContext.Provider>
    );
  },
);

export function useDesignSystemConfiguration(): DesignSystemConfigurationContextValue {
  const value = useContext(DesignSystemConfigurationContext);

  if (!value) {
    throw new Error('Missing DesignSystemConfigurationProvider');
  }

  return value;
}
