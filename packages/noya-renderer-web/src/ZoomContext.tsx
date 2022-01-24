import { createContext, useContext } from 'react';

/**
 * The current zoom level
 */
const ZoomContext = createContext(1);

export function useZoom() {
  return useContext(ZoomContext);
}

export const ZoomProvider = ZoomContext.Provider;
