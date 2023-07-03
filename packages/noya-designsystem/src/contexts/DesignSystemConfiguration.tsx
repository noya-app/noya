import { PlatformName } from 'noya-keymap';
import React, {
  createContext,
  memo,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import { ThemeProvider, useTheme } from 'styled-components';
import { ToastProvider } from '../components/Toast';
import { Theme } from '../theme';
import { DialogProvider } from './DialogContext';

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
    const contextValue = useMemo(() => ({ platform }), [platform]);

    return (
      <DesignSystemConfigurationContext.Provider value={contextValue}>
        <ThemeProvider theme={theme}>
          <DialogProvider>
            <ToastProvider>{children}</ToastProvider>
          </DialogProvider>
        </ThemeProvider>
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

export function useDesignSystemTheme() {
  return useTheme();
}
