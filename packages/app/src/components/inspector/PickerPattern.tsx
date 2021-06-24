import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Spacer,
  Select,
  Divider,
  getPatternBackground,
} from 'noya-designsystem';
import { memo, useMemo } from 'react';
import { FileMap } from 'noya-sketch-file';
import { PaddedSection, GridSmall, Row, Square } from './PickerAssetGrid';

interface Props {
  fileImages: FileMap;
  imageAssets: (Sketch.FileRef | Sketch.DataRef)[];
  onChange?: (color: Sketch.FileRef | Sketch.DataRef) => void;
}

export default memo(function ColorPickerPattern({
  fileImages,
  imageAssets,
  onChange,
}: Props) {
  const elements = useMemo(
    () =>
      imageAssets.map((item) => {
        const value = getPatternBackground(fileImages, item);

        if (!value) return null;

        return (
          <Square
            key={item._ref}
            background={value}
            onClick={() => onChange?.(item)}
          />
        );
      }),
    [fileImages, imageAssets, onChange],
  );

  return (
    <>
      <Divider />
      <PaddedSection>
        <Row>
          <Select
            id="document-images"
            options={['Document Images']}
            value="Document Images"
            onChange={() => {}}
          />
          <Spacer.Horizontal size={8} />
        </Row>
      </PaddedSection>
      <PaddedSection>
        <GridSmall>{elements}</GridSmall>
      </PaddedSection>
    </>
  );
});
