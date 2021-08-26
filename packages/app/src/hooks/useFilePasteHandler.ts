import { Size } from 'noya-geometry';
import { useEffect, useMemo } from 'react';
import { isSupportedFile, TypedFile } from '../components/FileDropTarget';
import { OffsetPoint } from '../containers/Canvas';

export function useImagePasteHandler<T extends string>({
  canvasSize,
  onPasteImages,
  supportedFileTypes,
}: {
  canvasSize: Size | undefined;
  onPasteImages: (files: TypedFile<T>[], offsetPoint: OffsetPoint) => void;
  supportedFileTypes: T[];
}) {
  const insertPoint = useMemo((): OffsetPoint => {
    const offsetSize = canvasSize ?? { width: 0, height: 0 };

    return {
      offsetX: offsetSize.width / 2,
      offsetY: offsetSize.height / 2,
    };
  }, [canvasSize]);

  useEffect(() => {
    const handler = (event: ClipboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;

      const items = [...(event.clipboardData ?? new DataTransfer()).items];

      const files = items.flatMap((item) => {
        if (item.kind !== 'file') return [];

        const file = item.getAsFile();

        if (!file || !isSupportedFile<T>(file, supportedFileTypes)) return [];

        return [file];
      });

      onPasteImages(files, insertPoint);
    };

    document.addEventListener('paste', handler);

    return () => document.removeEventListener('paste', handler);
  }, [insertPoint, onPasteImages, supportedFileTypes]);
}
