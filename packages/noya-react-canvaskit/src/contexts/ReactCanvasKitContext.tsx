import { Context } from 'noya-renderer';
import { createContext, useContext } from 'react';

const ReactCanvasKitContext = createContext<Context | undefined>(undefined);

export const ReactCanvasKitProvider = ReactCanvasKitContext.Provider;

export const useReactCanvasKit = (): Context => {
  const value = useContext(ReactCanvasKitContext);

  if (!value) throw new Error(`Missing ReactCanvasKitProvider`);

  return value;
};
