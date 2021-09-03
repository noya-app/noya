import { Size } from 'noya-geometry';
import { Base64 } from 'noya-utils';
import { useEffect, useMemo } from 'react';
import { isSupportedFile, TypedFile } from '../components/FileDropTarget';
import { OffsetPoint } from '../containers/Canvas';

export const IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS = 'ignore-global-events';

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
    const decoder = new TextDecoder();

    const handler = (event: ClipboardEvent) => {
      if (
        (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement) &&
        !event.target.classList.contains(IGNORE_GLOBAL_KEYBOARD_SHORTCUTS_CLASS)
      )
        return;

      const items = [...(event.clipboardData ?? new DataTransfer()).items];
      const layerEncripted = event.clipboardData?.getData('text/html');

      if (layerEncripted) {
        //TODO: store parent layer information in the clipboard
        const match = layerEncripted.match(/<p>\(noya\)(.*?)<\/p>/);
        if (!match) return;

        const encoded = match[1];

        const data = decoder.decode(Base64.decode(encoded));
        const jsonData = JSON.parse(data);

        onPasteLayer(jsonData);
        return;
      }

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
