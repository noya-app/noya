import { Canvas, CanvasKit } from 'canvaskit';
import { createContext, useContext } from 'react';

export interface ReactCanvasKitContext {
  CanvasKit: CanvasKit;
  canvas: Canvas;
}

const RCKContext = createContext<ReactCanvasKitContext | undefined>(undefined);

export const ReactCanvasKitProvider = RCKContext.Provider;

export const useReactCanvasKit = (): ReactCanvasKitContext => {
  const value = useContext(RCKContext);

  if (!value) throw new Error(`Missing ReactCanvasKitProvider`);

  return value;
};
