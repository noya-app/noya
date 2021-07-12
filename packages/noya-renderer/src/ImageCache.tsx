import Sketch from '@sketch-hq/sketch-file-format-ts';
import { generateImageFromPDF } from 'noya-pdf';
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
import { useApplicationState } from 'noya-app-state-context';

type ImageCache = Record<string, ArrayBuffer>;
type ImageCacheContextValue = [
  ImageCache,
  (key: string, value: ArrayBuffer) => void,
];

// We decode images using a global mutable cache since currently all React CanvasKit
// elements re-render on every state change, so state/ref gets recreated. When we fix
// that, we should move the cache into the Provider.
//
// TODO: Remove unused images so we don't run out of memory
const globalImageCache: ImageCache = {};

const ImageCacheContext = createContext<ImageCacheContextValue | undefined>(
  undefined,
);

export const ImageCacheProvider = memo(function ImageCacheProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const [id, forceUpdate] = useReducer((x) => x + 1, 0);

  const addImageToCache = useCallback((key: string, value: ArrayBuffer) => {
    globalImageCache[key] = value;
    forceUpdate();
  }, []);

  const contextValue = useMemo(
    (): ImageCacheContextValue => [globalImageCache, addImageToCache],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addImageToCache, id],
  );

  return (
    <ImageCacheContext.Provider value={contextValue}>
      {children}
    </ImageCacheContext.Provider>
  );
});

function useImageCache(): ImageCacheContextValue {
  const value = useContext(ImageCacheContext);

  if (!value) {
    throw new Error('Missing ImageCacheProvider');
  }

  return value;
}

export function useSketchImage(image?: Sketch.FileRef | Sketch.DataRef) {
  const [state] = useApplicationState();
  const [imageCache, addImageToCache] = useImageCache();

  const imageData = image
    ? imageCache[image._ref] || state.sketch.images[image._ref]
    : undefined;

  const ref = image?._ref;

  useEffect(() => {
    if (!ref || !ref.endsWith('.pdf') || !imageData || ref in imageCache)
      return;

    generateImageFromPDF(new Uint8Array(imageData))
      .then((blob) => blob.arrayBuffer())
      .then((arrayBuffer) => {
        addImageToCache(ref, arrayBuffer);
      });
  }, [addImageToCache, imageCache, imageData, ref]);

  return imageData;
}
