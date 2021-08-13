import { TypefaceFontProvider } from 'canvaskit';
import fetch from 'cross-fetch';
import { FontManager, SYSTEM_FONT_ID } from 'noya-fonts';
import { GoogleFontProvider } from 'noya-google-fonts';
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

export type IFontManager = Pick<
  FontManager,
  | 'getFontId'
  | 'getFontFamilyId'
  | 'getFontFamilyName'
  | 'getFontDescriptorsForFamily'
  | 'getFontFamilyIdList'
  | 'getBestFontDescriptor'
> & {
  getTypefaceFontProvider: () => TypefaceFontProvider;
};

const FontManagerContext = createContext<
  | {
      downloadFont: FontManager['downloadFont'];
      accessors: IFontManager;
    }
  | undefined
>(undefined);

const suspendedDefaultFont = new SuspendedValue<ArrayBuffer>(
  fetch(
    'https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf',
  ).then((resp) => resp.arrayBuffer()),
);

const sharedFontManager = new FontManager(GoogleFontProvider);

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

      typefaceFontProvider.registerFont(defaultFont, SYSTEM_FONT_ID);

      sharedFontManager.entries.forEach(([name, data]) => {
        typefaceFontProvider.registerFont(data, name.toString());
      });

      return typefaceFontProvider;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [CanvasKit.FontMgr, defaultFont, id],
  );

  const getTypefaceFontProvider = useCallback(() => typefaceFontProvider, [
    typefaceFontProvider,
  ]);

  useEffect(() => {
    const listener = () => forceUpdate();

    sharedFontManager.addListener(listener);

    return () => {
      sharedFontManager.removeListener(listener);
    };
  }, []);

  // We recreate the functions to ensure any components using them re-render
  const accessors: IFontManager = useMemo(
    () => ({
      getTypefaceFontProvider,
      getFontId: (...args) => sharedFontManager.getFontId(...args),
      getFontFamilyId: (...args) => sharedFontManager.getFontFamilyId(...args),
      getFontFamilyName: (...args) =>
        sharedFontManager.getFontFamilyName(...args),
      getFontDescriptorsForFamily: (...args) =>
        sharedFontManager.getFontDescriptorsForFamily(...args),
      getFontFamilyIdList: (...args) =>
        sharedFontManager.getFontFamilyIdList(...args),
      getBestFontDescriptor: (...args) =>
        sharedFontManager.getBestFontDescriptor(...args),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, getTypefaceFontProvider],
  );

  return (
    <FontManagerContext.Provider
      value={useMemo(
        () => ({
          typefaceFontProvider,
          downloadFont: sharedFontManager.downloadFont,
          accessors,
        }),
        [accessors, typefaceFontProvider],
      )}
    >
      {children}
    </FontManagerContext.Provider>
  );
});

export function useDownloadFont() {
  const value = useContext(FontManagerContext);

  if (!value) {
    throw new Error('Missing FontManagerProvider');
  }

  return value.downloadFont;
}

export function useFontManager(): IFontManager {
  const value = useContext(FontManagerContext);

  if (!value) {
    throw new Error('Missing FontManagerProvider');
  }

  return value.accessors;
}
