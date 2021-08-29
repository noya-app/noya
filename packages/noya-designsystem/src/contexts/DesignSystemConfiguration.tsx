import { PlatformName } from 'noya-keymap';
import { createContext, memo, ReactNode, useContext, useMemo } from 'react';
import { ThemeProvider } from 'styled-components';
import { Theme } from '../theme';

export type DesignSystemConfigurationContextValue = {
  platform: PlatformName;
};

const DesignSystemConfigurationContext = createContext<
  DesignSystemConfigurationContextValue | undefined
>(undefined);

export const DesignSystemConfigurationProvider = memo(
  function DesignSystemConfigurationProvider({
    children,
    theme,
    platform,
  }: {
    children: ReactNode;
    theme: Theme;
  } & DesignSystemConfigurationContextValue) {
    return (
      <DesignSystemConfigurationContext.Provider
        value={useMemo(() => ({ platform }), [platform])}
      >
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
