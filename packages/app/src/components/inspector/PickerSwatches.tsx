import { memo, useCallback, useState } from 'react';

import type Sketch from 'noya-file-format';
import { Button, Divider, Select, Spacer } from 'noya-web-designsystem';
import { ListView } from 'noya-designsystem';
import { sketchColorToRgbaString } from 'noya-colorpicker';
import { uuid } from 'noya-utils';
import * as InspectorPrimitives from '../inspector/InspectorPrimitives';
import {
  GridSmall,
  LayoutRadioGroup,
  LayoutType,
  Square,
} from './PickerAssetGrid';
import { useOpenInputDialog } from '../../contexts/DialogContext';

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
          onPress={() => {
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
  const openDialog = useOpenInputDialog();
  const [swatchLayout, setSwatchLayout] = useState<LayoutType>('grid');

  const isSwatch = swatches.some((e) => e.do_objectID === selectedId);

  const handleCreate = useCallback(async () => {
    const swatchName = await openDialog('New Theme Color Name');

    if (!swatchName) return;

    const id = uuid();

    onCreate(id, swatchName);
  }, [onCreate, openDialog]);

  return (
    <>
      <InspectorPrimitives.Section>
        {isSwatch ? (
          <Button id="detach-theme-color" onClick={onDetach}>
            Detach Theme Color
          </Button>
        ) : (
          <Button id="create-theme-color" onClick={handleCreate}>
            Create Theme Color
          </Button>
        )}
      </InspectorPrimitives.Section>
      <Divider />
      <InspectorPrimitives.Section>
        <InspectorPrimitives.Row>
          <Select
            id="colors-category"
            options={['Theme colors']}
            value="Theme colors"
            onChange={() => {}}
          />
          <Spacer.Horizontal size={8} />
          <LayoutRadioGroup layout={swatchLayout} setLayout={setSwatchLayout} />
        </InspectorPrimitives.Row>
      </InspectorPrimitives.Section>
      {swatches.length > 0 && (
        <InspectorPrimitives.Section>
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
        </InspectorPrimitives.Section>
      )}
    </>
  );
});
