import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  Button,
  Divider,
  ListView,
  Select,
  sketchColorToRgbaString,
  Spacer,
} from 'noya-designsystem';
import { uuid } from 'noya-renderer';
import { memo, useCallback, useState } from 'react';
import {
  GridSmall,
  LayoutPicker,
  LayoutType,
  PaddedSection,
  Row,
  Square,
} from './PickerAssetGrid';

interface SwatchesProps {
  selectedId?: string;
  swatches: Sketch.Swatch[];
  onSelect: (id: string) => void;
}

const SwatchesList = memo(function SwatchesList({
  selectedId,
  swatches,
  onSelect,
}: SwatchesProps) {
  return (
    <ListView.Root>
      {swatches.map((item) => (
        <ListView.Row
          id={item.do_objectID}
          key={item.do_objectID}
          selected={selectedId === item.do_objectID}
          onClick={() => {
            onSelect(item.do_objectID);
          }}
        >
          <Square background={sketchColorToRgbaString(item.value)} />
          <Spacer.Horizontal size={8} />
          {item.name}
        </ListView.Row>
      ))}
    </ListView.Root>
  );
});

const SwatchesGrid = memo(function SwatchesGrid({
  selectedId,
  swatches,
  onSelect,
}: SwatchesProps) {
  return (
    <GridSmall>
      {swatches.map((item) => (
        <Square
          key={item.do_objectID}
          background={sketchColorToRgbaString(item.value)}
          selected={selectedId === item.do_objectID}
          onClick={() => {
            onSelect(item.do_objectID);
          }}
        />
      ))}
    </GridSmall>
  );
});

interface Props {
  selectedId?: string;
  swatches: Sketch.Swatch[];
  onChange: (swatchID: string) => void;
  onCreate: (swatchID: string, name: string) => void;
  onDetach: () => void;
}

export default memo(function PickerSwatches({
  selectedId,
  swatches,
  onChange,
  onCreate,
  onDetach,
}: Props) {
  const [swatchLayout, setSwatchLayout] = useState<LayoutType>('grid');

  const isSwatch = swatches.some((e) => e.do_objectID === selectedId);

  const handleCreate = useCallback(() => {
    const swatchName = prompt('New Theme Color Name');

    if (!swatchName) return;

    const id = uuid();

    onCreate(id, swatchName);
  }, [onCreate]);

  return (
    <>
      <PaddedSection>
        {isSwatch ? (
          <Button id="detach-theme-color" onClick={onDetach}>
            Detach Theme Color
          </Button>
        ) : (
          <Button id="crete-theme-color" onClick={handleCreate}>
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
            selectedId={selectedId}
            swatches={swatches}
            onSelect={onChange}
          />
        ) : (
          <SwatchesList
            selectedId={selectedId}
            swatches={swatches}
            onSelect={onChange}
          />
        )}
      </PaddedSection>
    </>
  );
});
