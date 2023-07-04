import React from 'react';
import type { Ayon } from './Ayon';

export const AyonContext = React.createContext<typeof Ayon | undefined>(
  undefined,
);

export const AyonProvider = AyonContext.Provider;

export function useAyon() {
  const ayon = React.useContext(AyonContext);

  if (!ayon) {
    throw new Error('useAyon must be used within a AyonProvider');
  }

  return ayon;
}
