import { DragEvent, memo, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { OffsetPoint } from '../containers/Canvas';
import { useFileDropTarget } from '../hooks/useFileDropTarget';

export type TypedFile<T> = File & { type: T };

export function isSupportedFile<T extends string>(
  file: File,
  supportedFileTypes: T[],
): file is TypedFile<T> {
  return (
    supportedFileTypes.includes(file.type as T) ||
    (file.type === '' && file.name.endsWith('.sketch'))
  );
}

interface Props<T extends string> {
  children: ReactNode | ((isActive: boolean) => ReactNode);
  onDropFiles: (file: TypedFile<T>[], offsetPoint: OffsetPoint) => void;
  supportedFileTypes: T[];
}

const Container = styled.div(() => ({ display: 'flex', flex: 1 }));

export default memo(function FileDropTarget<T extends string>({
  children,
  onDropFiles,
  supportedFileTypes,
}: Props<T>) {
  const handleFile = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const offsetPoint = {
        offsetX: event.nativeEvent.offsetX,
        offsetY: event.nativeEvent.offsetY,
      };

      const unsupportedTypes = [...event.dataTransfer.files].flatMap((file) => {
        if (!isSupportedFile(file, supportedFileTypes)) {
          return [file.type];
        } else {
          return [];
        }
      });

      if (unsupportedTypes.length > 0) {
        alert(
          `Files of type ${unsupportedTypes.join(
            ', ',
          )} aren't supported. The following types are supported: ${supportedFileTypes.join(
            ', ',
          )}`,
        );
      }

      const files = [...event.dataTransfer.files].flatMap((file) =>
        isSupportedFile(file, supportedFileTypes) ? [file] : [],
      );

      onDropFiles(files, offsetPoint);
    },
    [onDropFiles, supportedFileTypes],
  );

  const { dropTargetProps, isDropTargetActive } = useFileDropTarget(handleFile);

  return (
    <Container {...dropTargetProps}>
      {typeof children === 'function' ? children(isDropTargetActive) : children}
    </Container>
  );
});
