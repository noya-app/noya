import { DragEvent, memo, ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { OffsetPoint } from '../containers/Canvas';
import { useFileDropTarget } from '../hooks/useFileDropTarget';

export type TypedFile<T> = File & { type: T };

export function isSupportedFile<T extends string>(
  file: File,
  supportedFileTypes: T[],
): file is TypedFile<T> {
  return supportedFileTypes.includes(file.type as T);
}

interface Props<T extends string> {
  children: ReactNode | ((isActive: boolean) => ReactNode);
  onDropFile: (file: TypedFile<T>, offsetPoint: OffsetPoint) => void;
  supportedFileTypes: T[];
}

const Container = styled.div(() => ({ display: 'flex', flex: 1 }));

export default memo(function ImageDropTarget<T extends string>({
  children,
  onDropFile,
  supportedFileTypes,
}: Props<T>) {
  const handleImageFile = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      [...event.dataTransfer.files].forEach((file) => {
        if (!isSupportedFile(file, supportedFileTypes)) {
          alert(
            `Files of type ${
              file.type
            } aren't supported. The following types are supported: ${supportedFileTypes.join(
              ', ',
            )}`,
          );
          return;
        }

        const offsetPoint = {
          offsetX: event.nativeEvent.offsetX,
          offsetY: event.nativeEvent.offsetY,
        };

        onDropFile(file, offsetPoint);
      });
    },
    [onDropFile, supportedFileTypes],
  );

  const { dropTargetProps, isDropTargetActive } = useFileDropTarget(
    handleImageFile,
  );

  return (
    <Container {...dropTargetProps}>
      {typeof children === 'function' ? children(isDropTargetActive) : children}
    </Container>
  );
});
