import { PlatformName } from 'noya-keymap';
import { createContext, useContext } from 'react';

export type EnvironmentParameters = {
  isElectron: boolean;
  platform: PlatformName;
  documentPath?: string;
};

const EnvironmentParametersContext = createContext<
  EnvironmentParameters | undefined
>(undefined);

export const EnvironmentParametersProvider =
  EnvironmentParametersContext.Provider;

function useEnvironmentParameters(): EnvironmentParameters {
  const value = useContext(EnvironmentParametersContext);

  if (!value) {
    throw new Error('Missing EnvironmentParametersProvider');
  }

  return value;
}

export function useEnvironmentParameter<K extends keyof EnvironmentParameters>(
  key: K,
): EnvironmentParameters[K] {
  return useEnvironmentParameters()[key];
}
