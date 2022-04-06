import React, { memo, useCallback, useState } from 'react';
import styled from 'styled-components';

import { fileOpen } from 'browser-fs-access';
import {
  useHover,
  PatternPreviewBackground,
  SupportedImageUploadType,
  SUPPORTED_IMAGE_UPLOAD_TYPES,
} from 'noya-designsystem';
import { getFileExtensionForType, uuid } from 'noya-utils';
import ImageDropTarget, { isSupportedFile, TypedFile } from '../FileDropTarget';
import { PatternPreviewProps } from './types';

const Container = styled.div<{
  isActive: boolean;
}>(({ theme, isActive }) => ({
  display: 'flex',
  flex: 1,
  position: 'relative',
  outline: 'none',
  borderRadius: '4px',
  overflow: 'hidden',
  minHeight: '150px',
  border: (isActive ? '2px ' : '0px ') + theme.colors.primaryDark,
  backgroundColor: 'white',
  imageRendering: 'crisp-edges',
  width: '100%',
  justifyContent: 'center',
}));

const DropTargetOverlay = styled.div(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  background: theme.colors.imageOverlay,
  pointerEvents: 'none',
}));

const UploadButton = styled.button<{ show: boolean }>(({ show = false }) => ({
  color: 'white',
  position: 'absolute',
  background: 'rgba(0, 0, 0, 0.75)',
  cursor: 'pointer',
  userSelect: 'auto',
  alignSelf: 'center',
  height: '30px',
  width: '105px',
  borderRadius: '24px',
  border: 'none',
  display: show ? 'block' : 'none',
  zIndex: 1,
}));

export default memo(
  ({ pattern, onAddImage, onChangeImage }: PatternPreviewProps) => {
    const [isHovering, onHoverChange] = useState(false);
    const { hoverProps } = useHover({
      onHoverChange,
    });

    const handleImageFile = useCallback(
      async (file: TypedFile<SupportedImageUploadType>) => {
        const data = await file.arrayBuffer();
        const _ref = `images/${uuid()}.${getFileExtensionForType(file.type)}`;

        onAddImage(data, _ref);
        onChangeImage({
          _class: 'MSJSONFileReference',
          _ref: _ref,
          _ref_class: 'MSImageData',
        });
      },
      [onAddImage, onChangeImage],
    );

    const openFile = useCallback(async () => {
      const file = await fileOpen({
        extensions: Object.values(SUPPORTED_IMAGE_UPLOAD_TYPES).map(
          (type) => '.' + getFileExtensionForType(type),
        ),
        mimeTypes: SUPPORTED_IMAGE_UPLOAD_TYPES,
      });

      if (!isSupportedFile(file, SUPPORTED_IMAGE_UPLOAD_TYPES)) {
        alert(
          `Files of type ${
            file.type
          } aren't supported. The following types are supported: ${SUPPORTED_IMAGE_UPLOAD_TYPES.join(
            ', ',
          )}`,
        );
        return;
      }

      handleImageFile(file);
    }, [handleImageFile]);

    return (
      <ImageDropTarget<SupportedImageUploadType>
        onDropFiles={useCallback(
          (files) => {
            if (files.length === 0) return;

            handleImageFile(files[0]);
          },
          [handleImageFile],
        )}
        supportedFileTypes={SUPPORTED_IMAGE_UPLOAD_TYPES}
      >
        {(isDropTargetActive: boolean) => (
          <Container {...hoverProps} isActive={isDropTargetActive}>
            {pattern.image && (
              <PatternPreviewBackground
                imageRef={pattern.image}
                fillType={pattern.patternFillType}
                tileScale={pattern.patternTileScale}
              />
            )}
            <UploadButton
              show={!isDropTargetActive && isHovering}
              onClick={openFile}
            >
              Upload Image
            </UploadButton>
            {isDropTargetActive && <DropTargetOverlay />}
          </Container>
        )}
      </ImageDropTarget>
    );
  },
);
