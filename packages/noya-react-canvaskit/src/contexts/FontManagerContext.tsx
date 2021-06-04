import { FontMgr } from 'canvaskit';
import { createContext, useContext } from 'react';

const FontManagerContext = createContext<FontMgr | undefined>(undefined);

export const FontManagerProvider = FontManagerContext.Provider;

export const useFontManager = (): FontMgr => {
  const value = useContext(FontManagerContext);

  if (!value) throw new Error(`Missing FontManagerProvider`);

  return value;
};
