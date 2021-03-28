import { Canvas, CanvasKit } from 'canvaskit-wasm';
import { createContext, useContext } from 'react';

export interface ReactCanvasKitContext {
  CanvasKit: CanvasKit;
  canvas: Canvas;
  canvasSize: {
    width: number;
    height: number;
  };
  theme: {
    textColor: string;
    backgroundColor: string;
  };
}

const RCKContext = createContext<ReactCanvasKitContext | undefined>(undefined);

export const ReactCanvasKitProvider = RCKContext.Provider;

export const useReactCanvasKit = (): ReactCanvasKitContext => {
  const value = useContext(RCKContext);

  if (!value) throw new Error(`Missing ReactCanvasKitProvider`);

  return value;
};
