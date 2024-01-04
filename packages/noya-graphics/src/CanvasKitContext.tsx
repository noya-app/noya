import type { CanvasKit } from '@noya-app/noya-canvaskit';
import { createContext, useContext } from 'react';

const CanvasKitContext = createContext<CanvasKit | undefined>(undefined);

export const CanvasKitProvider = CanvasKitContext.Provider;

export function useCanvasKit() {
  const value = useContext(CanvasKitContext);

  if (!value) {
    throw new Error('Missing CanvasKitContext');
  }

  return value;
}
