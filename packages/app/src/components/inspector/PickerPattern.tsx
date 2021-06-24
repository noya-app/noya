import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Spacer,
  Select,
  Divider,
  getPatternBackground,
} from 'noya-designsystem';
import { memo } from 'react';
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
        <GridSmall>
          {imageAssets.map((item) => {
            const value = getPatternBackground(fileImages, {
              _class: 'pattern',
              image: item,
              patternFillType: 0,
              patternTileScale: 0,
            });

            if (!value) return null;

            return (
              <Square
                key={item._ref}
                background={value.background}
                onClick={() => onChange?.(item)}
              />
            );
          })}
        </GridSmall>
      </PaddedSection>
    </>
  );
});
