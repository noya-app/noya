import { FontMgr } from 'canvaskit';
import {
  createContext,
  memo,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { useCanvasKit } from 'noya-renderer';

let cachedFontManager: FontMgr | undefined;
let isLoading = false;

const FontManagerContext = createContext<FontMgr | undefined>(undefined);

export const FontManagerProvider = memo(function FontManagerProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const CanvasKit = useCanvasKit();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const fontManager = useMemo(
    () => cachedFontManager ?? CanvasKit.FontMgr.RefDefault(),
    [CanvasKit.FontMgr],
  );

  useEffect(() => {
    if (isLoading) return;

    isLoading = true;

    fetch(
      'https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf',
    )
      .then((resp) => resp.arrayBuffer())
      .then((arrayBuffer) => {
        const fontManager = CanvasKit.FontMgr.FromData(arrayBuffer);

        if (!fontManager) return;

        cachedFontManager = fontManager;
        forceUpdate();
      });
  });

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
