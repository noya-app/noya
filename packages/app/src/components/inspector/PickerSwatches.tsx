import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Spacer,
  Select,
  sketchColorToRgbaString,
  ListView,
  Button,
  Divider,
} from 'noya-designsystem';
import { memo, useMemo, useState } from 'react';
import {
  PaddedSection,
  GridSmall,
  Row,
  Square,
  LayoutType,
  LayoutPicker,
} from './PickerAssetGrid';

interface SwatchesProps {
  selectedSwatchId?: string;
  swatches: Sketch.Swatch[];
  onSelectSwatch: (color: Sketch.Color) => void;
}

const SwatchesList = memo(function SwatchesList({
  selectedSwatchId,
  swatches,
  onSelectSwatch,
}: SwatchesProps) {
  return (
    <ListView.Root>
      {swatches.map((item) => {
        const colorString = sketchColorToRgbaString(item.value);

        return (
          <ListView.Row
            id={item.do_objectID}
            key={item.do_objectID}
            selected={selectedSwatchId === item.do_objectID}
            onClick={() => {
              onSelectSwatch({
                ...item.value,
                swatchID: item.do_objectID,
              });
            }}
          >
            <Square background={colorString} />
            <Spacer.Horizontal size={8} />
            {item.name}
          </ListView.Row>
        );
      })}
    </ListView.Root>
  );
});

const SwatchesGrid = memo(function SwatchesGrid({
  selectedSwatchId,
  swatches,
  onSelectSwatch,
}: SwatchesProps) {
  return (
    <GridSmall>
      {swatches.map((item) => {
        const colorString = sketchColorToRgbaString(item.value);

        return (
          <Square
            key={item.do_objectID}
            background={colorString}
            selected={selectedSwatchId === item.do_objectID}
            onClick={() => {
              onSelectSwatch({
                ...item.value,
                swatchID: item.do_objectID,
              });
            }}
          />
        );
      })}
    </GridSmall>
  );
});

interface Props {
  swatchID?: string;
  sharedSwatches: Sketch.Swatch[];
  onChange: (color: Sketch.Color) => void;
  onCreate: () => void;
  onDetach: () => void;
}

export default memo(function ColorPickerSwatches({
  swatchID,
  sharedSwatches,
  onChange,
  onCreate,
  onDetach,
}: Props) {
  const [swatchLayout, setSwatchLayout] = useState<LayoutType>('grid');

  const isSwatch = useMemo(
    () =>
      swatchID !== undefined &&
      sharedSwatches.some((e) => e.do_objectID === swatchID),
    [swatchID, sharedSwatches],
  );

  return (
    <>
      <PaddedSection>
        {isSwatch ? (
          <Button id={'detach-theme-color'} onClick={onDetach}>
            Detach Theme Color
          </Button>
        ) : (
          <Button id={'crete-theme-color'} onClick={onCreate}>
            Create Theme Color
          </Button>
        )}
      </PaddedSection>
      <Divider />
      <PaddedSection>
        <Row>
          <Select
            id="colors-category"
            options={['Theme colors']}
            value="Theme colors"
            onChange={() => {}}
          />
          <Spacer.Horizontal size={8} />
          <LayoutPicker layout={swatchLayout} setLayout={setSwatchLayout} />
        </Row>
      </PaddedSection>
      <PaddedSection>
        {swatchLayout === 'grid' ? (
          <SwatchesGrid
            selectedSwatchId={swatchID}
            swatches={sharedSwatches}
            onSelectSwatch={onChange}
          />
        ) : (
          <SwatchesList
            selectedSwatchId={swatchID}
            swatches={sharedSwatches}
            onSelectSwatch={onChange}
          />
        )}
      </PaddedSection>
    </>
  );
});
