import { TypefaceFontProvider } from 'canvaskit';
import fetch from 'cross-fetch';
import { FontId, FontManager, SYSTEM_FONT_ID } from 'noya-fonts';
import { GoogleFontProvider } from 'noya-google-fonts';
import { useCanvasKit } from 'noya-renderer';
import { SuspendedValue } from 'noya-utils';
import {
  createContext,
  memo,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
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

type FontManagerContextValue = IFontManager & {
  downloadFont: FontManager['downloadFont'];
};

const FontManagerContext = createContext<FontManagerContextValue | undefined>(
  undefined,
);

const suspendedDefaultFont = new SuspendedValue<ArrayBuffer>(
  fetch(
    'https://storage.googleapis.com/skia-cdn/google-web-fonts/Roboto-Regular.ttf',
  ).then((resp) => resp.arrayBuffer()),
);

const sharedFontManager = new FontManager(GoogleFontProvider);

interface Props {
  children?: ReactNode;
}

export const FontManagerProvider = memo(function FontManagerProvider({
  children,
}: Props) {
  const CanvasKit = useCanvasKit();

  const defaultFont = suspendedDefaultFont.getValueOrThrow();

  // When the component mounts, register all downloaded fonts.
  // We wrap the provider in a ref-like object so that setting state will trigger a re-render.
  const [typefaceFontProvider, setTypefaceFontProvider] = useState(() => {
    const provider = CanvasKit.TypefaceFontProvider.Make();
    provider.registerFont(defaultFont, SYSTEM_FONT_ID);
    sharedFontManager.entries.forEach(([name, data]) => {
      provider.registerFont(data, name);
    });
    return { current: provider };
  });

  useEffect(() => {
    // Register any fonts that get downloaded and trigger a re-render
    const listener = (fontId: FontId, data: ArrayBuffer) => {
      setTypefaceFontProvider((wrapped) => {
        wrapped.current.registerFont(data, fontId);
        return { current: wrapped.current };
      });
    };

    sharedFontManager.addDownloadedFontListener(listener);

    return () => sharedFontManager.removeDownloadedFontListener(listener);
  }, []);

  const contextValue = useMemo(
    (): FontManagerContextValue => ({
      getTypefaceFontProvider: () => typefaceFontProvider.current,
      ...createInlineWrapperFunctions(sharedFontManager),
    }),
    [typefaceFontProvider],
  );

  return (
    <FontManagerContext.Provider value={contextValue}>
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

  const { downloadFont, ...rest } = value;

  return rest;
}

/**
 * Create an inline wrapper around each function so that it doesn't get memoized.
 * We use this to expose a public API of a mutable object to the React world.
 */
function createInlineWrapperFunctions<T extends object>(object: T): T {
  const pairs = Object.entries(object).map(([key, value]) => {
    return [
      key,
      typeof value === 'function' ? (...args: any[]) => value(...args) : value,
    ] as const;
  });

  return Object.fromEntries(pairs) as T;
}
