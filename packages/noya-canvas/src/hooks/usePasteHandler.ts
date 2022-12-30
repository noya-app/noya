import Sketch from 'noya-file-format';
import { Size } from 'noya-geometry';
import { IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS } from 'noya-keymap';
import { isSupportedFile, OffsetPoint, TypedFile } from 'noya-react-utils';
import { ClipboardUtils } from 'noya-utils';
import { useEffect, useMemo } from 'react';
import { NoyaClipboardData } from './useCopyHandler';

export function usePasteHandler<T extends string>({
  canvasSize,
  onPasteImages,
  onPasteLayers: onPasteLayer,
  supportedFileTypes,
}: {
  canvasSize: Size | undefined;
  onPasteImages: (files: TypedFile<T>[], offsetPoint: OffsetPoint) => void;
  onPasteLayers: (layer: Sketch.AnyLayer[]) => void;
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
        if (
          typeof decodedData === 'object' &&
          decodedData &&
          'type' in decodedData
        ) {
          const data = decodedData as NoyaClipboardData;

          switch (data.type) {
            case 'layers': {
              onPasteLayer(data.layers);
            }
          }
        }
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
