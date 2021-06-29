import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { Divider, getPatternBackground, Select } from 'noya-designsystem';
import { FileMap } from 'noya-sketch-file';
import { memo } from 'react';
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
    image,
    onClick,
  }: {
    image: ArrayBuffer | string;
    onClick: () => void;
  }) => {
    const backgroundUrl = useObjectURL(image);
    return <Square background={`url(${backgroundUrl})`} onClick={onClick} />;
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
                image={getPatternBackground(fileImages, item)}
                onClick={() => onChange(item)}
              />
            ))}
          </GridSmall>
        </InspectorPrimitives.Section>
      )}
    </>
  );
});
