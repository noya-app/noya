import { Size } from 'noya-geometry';
import { FileInsertTarget } from 'noya-state';
import { useEffect } from 'react';
import { isSupportedFile, TypedFile } from '../components/ImageDropTarget';
import { OffsetPoint } from '../containers/Canvas';

export function useImagePasteHandler<T extends string>({
  canvasSize,
  onDropFile,
  supportedFileTypes,
}: {
  canvasSize: Size | undefined;
  onDropFile: (
    file: TypedFile<T>,
    insertTarget: FileInsertTarget,
    offsetPoint: OffsetPoint,
  ) => void;
  supportedFileTypes: T[];
}) {
  useEffect(() => {
    const handler = (event: ClipboardEvent) => {
      const items = [...(event.clipboardData ?? new DataTransfer()).items];

      items
        .filter((item) => item.kind === 'file')
        .forEach((item) => {
          const file = item.getAsFile();

          if (!file || !isSupportedFile<T>(file, supportedFileTypes)) return;

          const offsetSize = canvasSize ?? { width: 0, height: 0 };

          onDropFile(file, 'selectedArtboard', {
            offsetX: offsetSize.width / 2,
            offsetY: offsetSize.height / 2,
          });
        });
    };

    document.addEventListener('paste', handler);

    return () => document.removeEventListener('paste', handler);
  }, [canvasSize, onDropFile, supportedFileTypes]);
}
