import Sketch from '@sketch-hq/sketch-file-format-ts';
import { fileOpen } from 'browser-fs-access';
import {
  InputField,
  PatternPreviewBackground,
  Select,
  SketchPattern,
  Slider,
  SupportedImageUploadType,
  SUPPORTED_IMAGE_UPLOAD_TYPES,
  useHover,
} from 'noya-designsystem';
import { getFileExtensionForType, uuid } from 'noya-utils';
import { memo, useCallback, useState } from 'react';
import styled from 'styled-components';
import ImageDropTarget, { isSupportedFile, TypedFile } from '../FileDropTarget';
import * as InspectorPrimitives from './InspectorPrimitives';

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

interface Props {
  id: string;
  pattern: SketchPattern;
  onChangeImage: (image: Sketch.FileRef | Sketch.DataRef) => void;
  onChangeFillType: (amount: Sketch.PatternFillType) => void;
  onChangeTileScale: (amount: number) => void;
  createImage: (image: ArrayBuffer, _ref: string) => void;
}

export type PatternFillType = 'Stretch' | 'Fill' | 'Fit' | 'Tile';

export const PATTERN_FILL_TYPE_OPTIONS: PatternFillType[] = [
  'Tile',
  'Fill',
  'Stretch',
  'Fit',
];

interface PatternPreviewProps {
  pattern: SketchPattern;
  onAddImage: (image: ArrayBuffer, _ref: string) => void;
  onChangeImage: (image: Sketch.FileRef | Sketch.DataRef) => void;
}

const PatternPreview = memo(
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

export default memo(function PatternInspector({
  id,
  pattern,
  createImage,
  onChangeImage,
  onChangeFillType,
  onChangeTileScale,
}: Props) {
  const patternType = pattern.patternFillType;
  const isTile = patternType === Sketch.PatternFillType.Tile;
  const changeFillType = useCallback(
    (value: PatternFillType) => {
      onChangeFillType(Sketch.PatternFillType[value]);
    },
    [onChangeFillType],
  );

  const onSubmitTileScale = useCallback(
    (value: number) => {
      onChangeTileScale(value / 100);
    },
    [onChangeTileScale],
  );

  const onNudgeTileScale = useCallback(
    (value: number) => {
      onChangeTileScale(value / 100);
    },
    [onChangeTileScale],
  );

  const scale = Math.round(pattern.patternTileScale * 100);

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.Column>
        <PatternPreview
          pattern={pattern}
          onAddImage={createImage}
          onChangeImage={onChangeImage}
        />
        <InspectorPrimitives.VerticalSeparator />
        <InspectorPrimitives.LabeledRow label={'Size'}>
          <Select
            id={`${id}-pattern-options`}
            value={Sketch.PatternFillType[patternType] as PatternFillType}
            options={PATTERN_FILL_TYPE_OPTIONS}
            onChange={changeFillType}
          />
        </InspectorPrimitives.LabeledRow>
        {isTile && (
          <>
            <InspectorPrimitives.VerticalSeparator />
            <InspectorPrimitives.LabeledSliderRow label={'Scale'}>
              <Slider
                id={`${id}-slider`}
                value={scale}
                onValueChange={onSubmitTileScale}
                min={10}
                max={200}
              />
              <InspectorPrimitives.HorizontalSeparator />
              <InputField.Root size={50}>
                <InputField.NumberInput
                  value={scale}
                  onSubmit={onSubmitTileScale}
                  onNudge={onNudgeTileScale}
                />
                <InputField.Label>{'%'}</InputField.Label>
              </InputField.Root>
            </InspectorPrimitives.LabeledSliderRow>
          </>
        )}
      </InspectorPrimitives.Column>
    </InspectorPrimitives.Section>
  );
});
