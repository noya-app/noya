import { createContext, useContext } from 'react';

export type RenderingMode = 'static' | 'interactive';

const RenderingModeContext = createContext<RenderingMode>('static');

export const RenderingModeProvider = RenderingModeContext.Provider;

export function useRenderingMode(): RenderingMode {
  return useContext(RenderingModeContext);
}
