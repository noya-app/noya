import { TypefaceFontProvider } from 'canvaskit';
import fetch from 'cross-fetch';
import { FontManager } from 'noya-fonts';
import { FontFamilyID, FontVariant } from 'noya-google-fonts';
import { useCanvasKit } from 'noya-renderer';
import { SuspendedValue } from 'noya-utils';
import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

const FontManagerContext = createContext<
  | {
      typefaceFontProvider: TypefaceFontProvider;
      addFont: (fontFamily: FontFamilyID, fontVariant: FontVariant) => void;
    }
  | undefined
>(undefined);

const suspendedDefaultFont = new SuspendedValue<ArrayBuffer>(
  fetch(
    'http://fonts.gstatic.com/s/comicneue/v2/4UaHrEJDsxBrF37olUeDx63j5pN1MwI.ttf',
    // 'https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf',
  ).then((resp) => resp.arrayBuffer()),
);

export const FontManagerProvider = memo(function FontManagerProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const CanvasKit = useCanvasKit();

  const [id, forceUpdate] = useReducer((x) => x + 1, 0);

  const defaultFont = suspendedDefaultFont.getValueOrThrow();

  const typefaceFontProvider = useMemo(
    () => {
      const typefaceFontProvider = CanvasKit.TypefaceFontProvider.Make();

      typefaceFontProvider.registerFont(defaultFont, 'system');

      FontManager.shared.entries.forEach(([name, data]) => {
        typefaceFontProvider.registerFont(data, name.toString());
      });

      return typefaceFontProvider;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [CanvasKit.FontMgr, defaultFont, id],
  );

  useEffect(() => {
    const listener = () => forceUpdate();

    FontManager.shared.addListener(listener);

    return () => {
      FontManager.shared.removeListener(listener);
    };
  }, []);

  const addFont = useCallback(
    async (fontFamily: FontFamilyID, fontVariant: FontVariant) => {
      FontManager.shared.addFont(fontFamily, fontVariant);
    },
    [],
  );

  return (
    <FontManagerContext.Provider
      value={useMemo(() => ({ typefaceFontProvider, addFont }), [
        addFont,
        typefaceFontProvider,
      ])}
    >
      {children}
    </FontManagerContext.Provider>
  );
});

export function useAddFont() {
  const value = useContext(FontManagerContext);

  if (!value) {
    throw new Error('Missing FontManagerProvider');
  }

  return value.addFont;
}

export function useTypefaceFontProvider() {
  const value = useContext(FontManagerContext);

  if (!value) {
    throw new Error('Missing FontManagerProvider');
  }

  return value.typefaceFontProvider;
}
