import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { Divider, getPatternBackground, Select } from 'noya-designsystem';
import { FileMap } from 'noya-sketch-file';
import { memo, useCallback } from 'react';
import { useObjectURL } from '../../hooks/useObjectURL';
import * as InspectorPrimitives from '../inspector/InspectorPrimitives';
import { GridSmall, Square } from './PickerAssetGrid';

interface Props {
  fileImages: FileMap;
  imageAssets: (Sketch.FileRef | Sketch.DataRef)[];
  onChange: (file: Sketch.FileRef | Sketch.DataRef) => void;
}

const PatternSquare = memo(
  ({
    item,
    image,
    onClick,
  }: {
    item: Sketch.FileRef | Sketch.DataRef;
    image: ArrayBuffer;
    onClick: (file: Sketch.FileRef | Sketch.DataRef) => void;
  }) => {
    const backgroundUrl = useObjectURL(image);
    return (
      <Square
        background={`url(${backgroundUrl})`}
        onClick={useCallback(() => onClick(item), [item, onClick])}
      />
    );
  },
);

export default memo(function PickerPatterns({
  fileImages,
  imageAssets,
  onChange,
}: Props) {
  return (
    <>
      <Divider />
      <InspectorPrimitives.Section>
        <InspectorPrimitives.Row>
          <Select
            id="document-images"
            options={['Document Images']}
            value="Document Images"
            onChange={() => {}}
          />
        </InspectorPrimitives.Row>
      </InspectorPrimitives.Section>
      {imageAssets.length > 0 && (
        <InspectorPrimitives.Section>
          <GridSmall>
            {imageAssets.map((item) => (
              <PatternSquare
                key={item._ref}
                item={item}
                image={getPatternBackground(fileImages, item)}
                onClick={onChange}
              />
            ))}
          </GridSmall>
        </InspectorPrimitives.Section>
      )}
    </>
  );
});
