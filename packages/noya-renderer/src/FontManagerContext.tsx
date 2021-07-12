import fetch from 'cross-fetch';
import { FontMgr } from 'canvaskit';
import { useCanvasKit } from 'noya-renderer';
import { SuspendedValue } from 'noya-utils';
import { createContext, memo, ReactNode, useContext, useMemo } from 'react';

const FontManagerContext = createContext<FontMgr | undefined>(undefined);

const suspendedDefaultFont = new SuspendedValue<ArrayBuffer>(
  fetch(
    'https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf',
  ).then((resp) => resp.arrayBuffer()),
);

export const FontManagerProvider = memo(function FontManagerProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const CanvasKit = useCanvasKit();

  const defaultFont = suspendedDefaultFont.getValueOrThrow();
  const fontManager = useMemo(
    () =>
      CanvasKit.FontMgr.FromData(defaultFont) ?? CanvasKit.FontMgr.RefDefault(),
    [CanvasKit.FontMgr, defaultFont],
  );

  return (
    <FontManagerContext.Provider value={fontManager}>
      {children}
    </FontManagerContext.Provider>
  );
});

export function useFontManager(): FontMgr {
  const value = useContext(FontManagerContext);

  if (!value) {
    throw new Error('Missing FontManagerProvider');
  }

  return value;
}
