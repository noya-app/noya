import { ImageDataProvider } from '@noya-app/noya-designsystem';
import { FileMap } from '@noya-app/noya-sketch-file';
import { useIsMounted, useMutableState } from '@noya-app/react-utils';
import { useApplicationState } from 'noya-app-state-context';
import { generateImageFromPDF } from 'noya-pdf';
import React, {
  ReactNode,
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

type ImageCache = Record<string, ArrayBuffer>;
type ImageCacheContextValue = [
  ImageCache,
  (key: string, value: ArrayBuffer) => void,
];

// We decode images using a global mutable cache to share images between
// renderer instances.
//
// TODO: Remove unused images so we don't run out of memory
const globalImageCache: ImageCache = {};

const ImageCacheContext = createContext<ImageCacheContextValue | undefined>(
  undefined,
);

interface Props {
  children?: ReactNode;
}

export const ImageCacheProvider = memo(function ImageCacheProvider({
  children,
}: Props) {
  const [imageCache, updateImageCache] = useMutableState(globalImageCache);
  const [state] = useApplicationState();

  const isMounted = useIsMounted();

  const addImageToCache = useCallback(
    (key: string, value: ArrayBuffer) => {
      if (!isMounted.current) return;

      updateImageCache((imageCache) => {
        imageCache[key] = value;
      });
    },
    [isMounted, updateImageCache],
  );

  const contextValue = useMemo(
    (): ImageCacheContextValue => [imageCache, addImageToCache],
    [addImageToCache, imageCache],
  );

  const isLoadingImageMapRef = useRef<Record<string, boolean>>({});

  const getImageData = useCallback(
    (ref: string) => {
      const { imageData, pdfData } = getData(
        ref,
        imageCache,
        state.sketch.images,
      );

      if (!imageData && pdfData) {
        if (isLoadingImageMapRef.current[ref]) return;

        isLoadingImageMapRef.current[ref] = true;

        generateImageFromPDF(new Uint8Array(pdfData))
          .then((blob) => blob.arrayBuffer())
          .then((arrayBuffer) => {
            addImageToCache(ref, arrayBuffer);
          });
      }

      return imageData;
    },
    [addImageToCache, imageCache, state.sketch.images],
  );

  return (
    <ImageCacheContext.Provider value={contextValue}>
      <ImageDataProvider getImageData={getImageData}>
        {children}
      </ImageDataProvider>
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

export function useSketchImage(ref?: string) {
  const [state] = useApplicationState();
  const [imageCache, addImageToCache] = useImageCache();

  const { pdfData, imageData } = getData(ref, imageCache, state.sketch.images);

  useEffect(() => {
    if (imageData || !ref || !pdfData) return;

    generateImageFromPDF(new Uint8Array(pdfData))
      .then((blob) => blob.arrayBuffer())
      .then((arrayBuffer) => {
        addImageToCache(ref, arrayBuffer);
      });
  }, [addImageToCache, imageCache, imageData, pdfData, ref]);

  return imageData;
}

function getData(
  ref: string | undefined,
  imageCache: ImageCache,
  fileMap: FileMap,
) {
  if (!ref) return {};

  const isPDF = ref.endsWith('.pdf');

  const imageData =
    ref && ref in imageCache
      ? imageCache[ref]
      : !isPDF
      ? fileMap[ref]
      : undefined;

  const pdfData = isPDF ? fileMap[ref] : undefined;

  return { pdfData, imageData };
}
