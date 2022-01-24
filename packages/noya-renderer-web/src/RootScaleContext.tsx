import { createContext, useContext } from 'react';

/**
 * The scale of the entire rendering surface.
 *
 * We set this to support high pixel densities.
 */
const RootScaleContext = createContext(1);

export function useRootScale() {
  return useContext(RootScaleContext);
}

export const RootScaleProvider = RootScaleContext.Provider;
