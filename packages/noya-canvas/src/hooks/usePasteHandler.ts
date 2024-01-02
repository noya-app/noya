import { ClipboardUtils } from '@noya-app/noya-utils';
import Sketch from 'noya-file-format';
import { elementShouldHandleOwnShortcut } from 'noya-keymap';
import { isSupportedFile, TypedFile } from 'noya-react-utils';
import { useEffect } from 'react';
import { NoyaClipboardData } from './useCopyHandler';

export function usePasteHandler<T extends string>({
  onPasteImages,
  onPasteLayers,
  supportedFileTypes = [],
}: {
  onPasteImages?: (files: TypedFile<T>[]) => void;
  onPasteLayers?: (layer: Sketch.AnyLayer[]) => void;
  supportedFileTypes?: T[];
}) {
  useEffect(() => {
    const handler = (event: ClipboardEvent) => {
      if (elementShouldHandleOwnShortcut(event.target)) return;

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
              onPasteLayers?.(data.layers);
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

      onPasteImages?.(files);
    };

    document.addEventListener('paste', handler);

    return () => document.removeEventListener('paste', handler);
  }, [onPasteImages, onPasteLayers, supportedFileTypes]);
}
