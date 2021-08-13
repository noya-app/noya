import { FontMgr, TypefaceFontProvider } from 'canvaskit';
import fetch from 'cross-fetch';
import { FontFamilyID, FontVariant, getFontFile } from 'noya-google-fonts';
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

export class FontID extends String {
  // Enforce typechecking. Without this, TypeScript will allow string literals
  __tag: any;

  static make(fontFamilyID: FontFamilyID, fontVariant: FontVariant) {
    return new FontID(`${fontFamilyID}-${fontVariant}`);
  }
}

class Emitter {
  private listeners: (() => void)[] = [];

  addListener(f: () => void) {
    this.listeners.push(f);
  }

  removeListener(f: () => void) {
    const index = this.listeners.indexOf(f);

    if (index === -1) return;

    this.listeners.splice(index, 1);
  }

  emit() {
    this.listeners.forEach((l) => l());
  }
}

export class FontManager extends Emitter {
  get entries() {
    return [...this.loadedFonts.entries()];
  }

  get values() {
    return [...this.loadedFonts.values()];
  }

  private loadedFonts: Map<string, ArrayBuffer> = new Map();

  private pendingFonts: Set<string> = new Set();

  async addFont(fontFamily: FontFamilyID, fontVariant: FontVariant) {
    const url = getFontFile(fontFamily, fontVariant);
    const fontId = FontID.make(fontFamily, fontVariant);

    let data: ArrayBuffer;

    try {
      data = await fetch(url).then((resp) => resp.arrayBuffer());
    } catch (error) {
      console.warn('Failed to load font', fontId);
      return;
    } finally {
      this.pendingFonts.delete(fontId.toString());
    }

    console.info('fetched font', {
      fontFamily,
      fontVariant,
      url,
      data: data.byteLength,
    });

    this.loadedFonts.set(fontId.toString(), data);

    this.emit();
  }

  static shared = new FontManager();
}

const FontManagerContext = createContext<
  | {
      fontManager: FontMgr;
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

  const fontManager = useMemo(
    () =>
      CanvasKit.FontMgr.FromData(defaultFont, ...FontManager.shared.values) ??
      CanvasKit.FontMgr.RefDefault(),
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
      value={useMemo(
        () => ({
          fontManager,
          typefaceFontProvider,
          addFont,
        }),
        [addFont, fontManager, typefaceFontProvider],
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

export function useTypefaceFontProvider() {
  const value = useContext(FontManagerContext);

  if (!value) {
    throw new Error('Missing FontManagerProvider');
  }

  return value.typefaceFontProvider;
}
