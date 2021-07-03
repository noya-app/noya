import Sketch from '@sketch-hq/sketch-file-format-ts';
import { fileOpen } from 'browser-fs-access';
import {
  InputField,
  PatternPreviewBackground,
  Select,
  SketchPattern,
  Slider,
  Spacer,
  SUPPORTED_FILE_TYPES,
} from 'noya-designsystem';
import { useHover } from 'noya-designsystem/src/hooks/useHover';
import { uuid } from 'noya-renderer';
import { FileMap } from 'noya-sketch-file';
import { DragEvent, memo, useCallback, useState } from 'react';
import styled from 'styled-components';
import { useFileDropTarget } from '../../hooks/useFileDropTarget';
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
  images: FileMap;
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
  images: FileMap;

  pattern: SketchPattern;
  isTile: boolean;
  onAddImage: (image: ArrayBuffer, _ref: string) => void;
  onChangeImage: (image: Sketch.FileRef | Sketch.DataRef) => void;
}

const PatternPreview = memo(
  ({
    images,
    pattern,
    isTile,
    onAddImage,
    onChangeImage,
  }: PatternPreviewProps) => {
    const [isHovering, onHoverChange] = useState(false);
    const { hoverProps } = useHover({
      onHoverChange,
    });

    const handleImageFile = useCallback(
      async (file: File) => {
        const extension = SUPPORTED_FILE_TYPES[file.type];

        if (!extension) {
          alert(
            `Files of type ${file.type} aren't supported. Files of type png, jpg, and webp are supported.`,
          );
          return;
        }

        const data = await file.arrayBuffer();
        const _ref = `images/${uuid()}.${extension}`;

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
        extensions: Object.values(SUPPORTED_FILE_TYPES).map((e) => '.' + e),
        mimeTypes: Object.keys(SUPPORTED_FILE_TYPES),
      });

      handleImageFile(file);
    }, [handleImageFile]);

    const handleDropEvent = useCallback(
      async (e: DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];

        if (!file) {
          alert('Unable to read file');
          return;
        }

        handleImageFile(file);
      },
      [handleImageFile],
    );

    const { dropTargetProps, isDropTargetActive } = useFileDropTarget(
      handleDropEvent,
    );

    return (
      <Container
        {...dropTargetProps}
        {...hoverProps}
        isActive={isDropTargetActive}
      >
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
    );
  },
);

export default memo(function PatternInspector({
  id,
  images,
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
          images={images}
          pattern={pattern}
          isTile={isTile}
          onAddImage={createImage}
          onChangeImage={onChangeImage}
        />
        <Spacer.Vertical size={10} />
        <InspectorPrimitives.LabeledRow label={'Size'}>
          <Spacer.Vertical size={10} />
          <Select
            id={`${id}-pattern-options`}
            value={Sketch.PatternFillType[patternType] as PatternFillType}
            options={PATTERN_FILL_TYPE_OPTIONS}
            onChange={changeFillType}
          />
        </InspectorPrimitives.LabeledRow>
        {isTile && (
          <>
            <Spacer.Vertical size={10} />
            <InspectorPrimitives.LabeledSliderRow label={'Scale'}>
              <Slider
                id={`${id}-slider`}
                value={scale}
                onValueChange={onSubmitTileScale}
                min={10}
                max={200}
              />
              <Spacer.Horizontal size={10} />
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
