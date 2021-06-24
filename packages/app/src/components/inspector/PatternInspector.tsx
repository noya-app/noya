import Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Select,
  Spacer,
  Slider,
  InputField,
  getPatternBackground,
  SketchPattern,
  imgFileExtensions,
  mimeTypes,
  getPatternSize,
} from 'noya-designsystem';
import { memo, useCallback, useMemo, useState, DragEvent } from 'react';
import styled from 'styled-components';
import * as InspectorPrimitives from './InspectorPrimitives';
import { fileOpen } from 'browser-fs-access';
import { uuid } from 'noya-renderer';
import { FileMap } from 'noya-sketch-file';

const Column = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
}));

const Container = styled.div<{
  background: string;
  backgroundSize: string;
  repeat: boolean;
  isDragOver: boolean;
}>(({ theme, background, backgroundSize, repeat, isDragOver }) => {
  const dragOverlayColor =
    theme.colors.primary.replace('rgb', 'rgba').slice(0, -1) + ',0.5)';

  const gradientOverlay = `linear-gradient(0deg, ${dragOverlayColor}, ${dragOverlayColor})`;
  return {
    display: 'flex',
    flex: 1,
    position: 'relative',
    outline: 'none',
    borderRadius: '4px',
    minHeight: '150px',
    background: (isDragOver ? `${gradientOverlay},` : '') + background,
    border: (isDragOver ? '2px ' : '0px ') + theme.colors.primaryDark,
    backgroundColor: 'white',
    backgroundPosition: 'center',
    backgroundRepeat: repeat ? 'auto' : 'no-repeat',
    backgroundSize,
    imageRendering: 'crisp-edges',
    width: '100%',
    justifyContent: 'center',
  };
});

const UploadButton = styled.button<{ show: boolean }>(
  ({ theme, show = false }) => ({
    color: theme.colors.button.secondaryText,
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
  }),
);

interface Props {
  id: string;
  images: FileMap;
  pattern: SketchPattern;
  onChangeImage?: (image: Sketch.FileRef | Sketch.DataRef) => void;
  onChangeFillType?: (amount: Sketch.PatternFillType) => void;
  onChangeTileScale?: (amount: number) => void;
  createImage: (image: ArrayBuffer, _ref: string) => void;
}

export type PatternFillTypes = 'Stretch' | 'Fill' | 'Fit' | 'Tile';
export const patternFillTypeOptions: PatternFillTypes[] = [
  'Tile',
  'Fill',
  'Stretch',
  'Fit',
];

export default memo(function PatternInspector({
  id,
  images,
  pattern,
  onChangeImage,
  onChangeFillType,
  onChangeTileScale,
  createImage,
}: Props) {
  const [showButton, setShowButton] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const patternType = pattern.patternFillType;
  const isTile = patternType === Sketch.PatternFillType.Tile;

  const changeFillType = useCallback(
    (value: PatternFillTypes) => {
      onChangeFillType?.(Sketch.PatternFillType[value]);
    },
    [onChangeFillType],
  );

  const onSubmitTileScale = useCallback(
    (value: number) => {
      onChangeTileScale?.(value / 100);
    },
    [onChangeTileScale],
  );

  const onNudgeTileScale = useCallback(
    (value: number) => {
      onChangeTileScale?.(value / 100);
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
      const data = await file.arrayBuffer();

      const extension = file.type.split('/')[1];
      const _ref = `images/${uuid()}.${extension}`;

      createImage(data, _ref);
      onChangeImage?.({
        _class: 'MSJSONFileReference',
        _ref: _ref,
        _ref_class: 'MSImageData',
      });
    },
    [createImage, onChangeImage],
  );

  const openFile = useCallback(async () => {
    const file = await fileOpen({
      extensions: imgFileExtensions.map((e) => `.${e}`),
      mimeTypes: mimeTypes,
    });

    handleImageFile(file);
  }, [handleImageFile]);

  const handleDragEvent = useCallback((e: DragEvent, on?: boolean) => {
    if (on) setIsDragOver(on);
    e.preventDefault();
    // Do something
  }, []);

  const handleDropEvent = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      for (const item of e.dataTransfer.items) {
        // Careful: `kind` will be 'file' for both file
        // _and_ directory entries.
        if (item.kind === 'file' && mimeTypes.includes(item.type)) {
          const entry = await item.getAsFile();

          if (!entry) return;
          handleImageFile(entry);
        }
      }
      setIsDragOver(false);
    },
    [handleImageFile],
  );

  const scale = Math.round(pattern.patternTileScale * 100);
  return (
    <Column>
      <Container
        onDragOver={handleDragEvent}
        onDragEnter={(e: DragEvent) => handleDragEvent(e, true)}
        onDragLeave={(e: DragEvent) => handleDragEvent(e, false)}
        onDrop={handleDropEvent}
        isDragOver={isDragOver}
        background={background}
        backgroundSize={backgroundSize}
        repeat={isTile}
        onMouseEnter={() => setShowButton(true)}
        onMouseLeave={() => setShowButton(false)}
      >
        <UploadButton show={!isDragOver && showButton} onClick={openFile}>
          Upload Image
        </UploadButton>
      </Container>
      <Spacer.Vertical size={10} />
      <InspectorPrimitives.LabeledRow label={'Size'}>
        <Spacer.Vertical size={10} />
        <Select
          id={`${id}-pattern-options`}
          value={Sketch.PatternFillType[patternType] as PatternFillTypes}
          options={patternFillTypeOptions}
          onChange={changeFillType}
        />
      </InspectorPrimitives.LabeledRow>
      <Spacer.Vertical size={10} />
      {isTile && (
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
      )}
    </Column>
  );
});
