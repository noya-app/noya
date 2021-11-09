import { Size } from 'noya-geometry';
import { IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS } from 'noya-keymap';
import { ClipboardUtils } from 'noya-utils';
import { useEffect, useMemo } from 'react';
import { isSupportedFile, TypedFile } from '../components/FileDropTarget';
import { OffsetPoint } from '../containers/Canvas';

export function usePasteHandler<T extends string>({
  canvasSize,
  onPasteImages,
  onPasteLayer,
  supportedFileTypes,
}: {
  canvasSize: Size | undefined;
  onPasteImages: (files: TypedFile<T>[], offsetPoint: OffsetPoint) => void;
  onPasteLayer: (layer: any) => void;
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
        (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement) &&
        !event.target.classList.contains(IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS)
      )
        return;

      const encodedHTML = event.clipboardData?.getData('text/html');
      const decodedData = encodedHTML
        ? ClipboardUtils.fromEncodedHTML(encodedHTML)
        : undefined;

      if (decodedData !== undefined) {
        onPasteLayer(decodedData);
        return;
      }

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
  }, [insertPoint, onPasteImages, onPasteLayer, supportedFileTypes]);
}
