import { TypefaceFontProvider } from 'canvaskit';
import { FontId, FontManager, SYSTEM_FONT_ID } from 'noya-fonts';
import { GoogleFontProvider } from 'noya-google-fonts';
import { getPublicPath } from 'noya-public-path';
import { SuspendedValue, useMutableState } from 'noya-react-utils';
import { useCanvasKit } from 'noya-renderer';
import React, {
  createContext,
  memo,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
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

const load = (name: string) => {
  const path = getPublicPath() + 'fonts/' + name;

  // Detect node vs browser
  return typeof window !== 'undefined' && typeof fetch !== 'undefined'
    ? fetch(path).then((response) => response.arrayBuffer())
    : (require('fs').promises.readFile(path) as Promise<ArrayBuffer>);
};

const suspendedDefaultFont = new SuspendedValue<ArrayBuffer>(
  load('roboto/Roboto-Regular.ttf'),
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

  const [typefaceFontProvider, updateTypefaceFontProvider] = useMutableState(
    () => {
      const provider = CanvasKit.TypefaceFontProvider.Make();
      provider.registerFont(defaultFont, SYSTEM_FONT_ID);
      sharedFontManager.entries.forEach(([name, data]) => {
        provider.registerFont(data, name);
      });
      return provider;
    },
  );

  useEffect(() => {
    // Register any fonts that get downloaded and trigger a re-render
    const listener = (fontId: FontId, data: ArrayBuffer) => {
      updateTypefaceFontProvider((provider) => {
        provider.registerFont(data, fontId);
      });
    };

    sharedFontManager.addDownloadedFontListener(listener);

    return () => sharedFontManager.removeDownloadedFontListener(listener);
  }, [updateTypefaceFontProvider]);

  const contextValue = useMemo(
    (): FontManagerContextValue => ({
      getTypefaceFontProvider: () => typefaceFontProvider,
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

  return value;
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
