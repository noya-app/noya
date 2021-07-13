import { memo, DragEvent, useCallback, ReactNode } from 'react';
import { useFileDropTarget } from '../hooks/useFileDropTarget';
import styled from 'styled-components';
import { SUPPORTED_FILE_TYPES } from 'noya-designsystem';
import { OffsetPoint } from '../containers/Canvas';

interface Props {
  children: ReactNode | ((isActive: boolean) => ReactNode);
  onDropFile: (file: File, extension: string, event: OffsetPoint) => void;
}

const Container = styled.div(() => ({ display: 'flex', flex: 1 }));

export default memo(function ImageDropTarget({ children, onDropFile }: Props) {
  const handleImageFile = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (!e.dataTransfer) return;
      const file = e.dataTransfer.files[0];

      if (!file) {
        alert('Unable to read file');
        return;
      }

      const extension = SUPPORTED_FILE_TYPES[file.type];

      if (!extension) {
        alert(
          `Files of type ${file.type} aren't supported. Files of type png, jpg, and webp are supported.`,
        );
        return;
      }

      const offsetPoint = {
        offsetX: e.nativeEvent.offsetX,
        offsetY: e.nativeEvent.offsetY,
      };

      onDropFile(file, extension, offsetPoint);
    },
    [onDropFile],
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
