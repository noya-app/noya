import { FontMgr } from 'canvaskit';
import fetch from 'cross-fetch';
import { FontVariant, getFontFile, hasFontFamily } from 'noya-google-fonts';
import { useCanvasKit } from 'noya-renderer';
import { Selectors } from 'noya-state';
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

const loadedFonts: Record<string, ArrayBuffer> = {};
const pendingFonts: Set<string> = new Set();
let listeners: (() => void)[] = [];

const FontManagerContext = createContext<
  | {
      fontManager: FontMgr;
      addFont: (fontFamily: string, fontVariant: FontVariant) => void;
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
  const fontManager = useMemo(
    () => {
      const fonts = Object.values(loadedFonts);

      // console.log('creating font manager', defaultFont, ...fonts);

      const manager = CanvasKit.FontMgr.FromData(defaultFont, ...fonts);

      if (!manager) {
        console.error('Failed to create font manager');
        return CanvasKit.FontMgr.RefDefault();
      }

      // let count = manager.countFamilies();

      // console.log('font family count', count);

      // for (let i = 0; i < count; i++) {
      //   console.log('family', i, manager.getFamilyName(i));
      // }

      return manager;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [CanvasKit.FontMgr, defaultFont, id],
  );

  useEffect(() => {
    const listener = () => {
      forceUpdate();
    };

    listeners.push(listener);

    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const addFont = useCallback(
    async (fontFamily: string, fontVariant: FontVariant) => {
      if (!hasFontFamily(fontFamily)) {
        // console.info(
        //   `Ignore loading unrecognized font: ${fontFamily}, ${fontVariant}`,
        // );
        return;
      }

      const fontName = Selectors.encodeFontName(fontFamily, fontVariant);

      if (pendingFonts.has(fontName) || fontName in loadedFonts) return;

      pendingFonts.add(fontName);

      const url = getFontFile(fontFamily, fontVariant);

      let data: ArrayBuffer;

      try {
        data = await fetch(url).then((resp) => resp.arrayBuffer());
      } catch (error) {
        console.warn('Failed to load font', fontName);
        return;
      } finally {
        pendingFonts.delete(fontName);
      }

      console.info('fetched font', {
        fontFamily,
        fontVariant,
        url,
        data: data.byteLength,
      });

      loadedFonts[fontName] = data;

      listeners.forEach((l) => l());
    },
    [],
  );

  // console.log('re', fontManager.countFamilies(), loadedFonts);

  return (
    <FontManagerContext.Provider
      value={useMemo(
        () => ({
          fontManager,
          addFont,
        }),
        [addFont, fontManager],
      )}
    >
      {children}
    </FontManagerContext.Provider>
  );
});

export function useFontManager(): FontMgr {
  const value = useContext(FontManagerContext);

  if (!value) {
    throw new Error('Missing FontManagerProvider');
  }

  return value.fontManager;
}

export function useAddFont() {
  const value = useContext(FontManagerContext);

  if (!value) {
    throw new Error('Missing FontManagerProvider');
  }

  return value.addFont;
}
