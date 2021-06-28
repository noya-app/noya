import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Select,
  Spacer,
  Slider,
  InputField,
  getPatternBackground,
  SketchPattern,
  getPatternSize,
  SUPPORTED_FILE_TYPES,
} from 'noya-designsystem';
import { memo, useCallback, useMemo, useState, DragEvent } from 'react';
import styled from 'styled-components';
import * as InspectorPrimitives from './InspectorPrimitives';
import { fileOpen } from 'browser-fs-access';
import { uuid } from 'noya-renderer';
import { FileMap } from 'noya-sketch-file';
import { useHover } from 'noya-designsystem/src/hooks/useHover';
import { useFileDropTarget } from '../../hooks/useFileDropTarget';

const Container = styled.div<{
  background: string;
  backgroundSize: string;
  repeat: boolean;
  isActive: boolean;
}>(({ theme, background, backgroundSize, repeat, isActive }) => ({
  display: 'flex',
  flex: 1,
  position: 'relative',
  outline: 'none',
  borderRadius: '4px',
  minHeight: '150px',
  background: (isActive ? `${theme.colors.imageOverlay},` : '') + background,
  border: (isActive ? '2px ' : '0px ') + theme.colors.primaryDark,
  backgroundColor: 'white',
  backgroundPosition: 'center',
  backgroundRepeat: repeat ? 'auto' : 'no-repeat',
  backgroundSize,
  imageRendering: 'crisp-edges',
  width: '100%',
  justifyContent: 'center',
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

export default memo(function PatternInspector({
  id,
  images,
  pattern,
  createImage,
  onChangeImage,
  onChangeFillType,
  onChangeTileScale,
}: Props) {
  const [isHovering, onHoverChange] = useState(false);
  const { hoverProps } = useHover({
    onHoverChange,
  });

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

  const background = useMemo(
    () => getPatternBackground(images, pattern.image),
    [images, pattern.image],
  );

  const backgroundSize = useMemo(
    () => getPatternSize(pattern.patternFillType, pattern.patternTileScale),
    [pattern.patternFillType, pattern.patternTileScale],
  );

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

      createImage(data, _ref);
      onChangeImage({
        _class: 'MSJSONFileReference',
        _ref: _ref,
        _ref_class: 'MSImageData',
      });
    },
    [createImage, onChangeImage],
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

  const scale = Math.round(pattern.patternTileScale * 100);

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.Column>
        <Container
          {...dropTargetProps}
          {...hoverProps}
          isActive={isDropTargetActive}
          background={background}
          backgroundSize={backgroundSize}
          repeat={isTile}
        >
          <UploadButton
            show={!isDropTargetActive && isHovering}
            onClick={openFile}
          >
            Upload Image
          </UploadButton>
        </Container>
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
