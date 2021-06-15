import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { GridIcon, RowsIcon } from '@radix-ui/react-icons';
import {
  Spacer,
  RadioGroup,
  Select,
  sketchColorToRgbaString,
  ListView,
  Button,
  Divider,
} from 'noya-designsystem';
import { memo, useMemo, useState } from 'react';
import styled from 'styled-components';

const PaddedSection = styled.section({
  padding: '8px 10px',
  display: 'flex',
  flexDirection: 'column',
});

const Square = styled.div<{ color: string; selected?: boolean }>(
  ({ theme, color, selected = false }) => ({
    height: '25px',
    width: '25px',
    backgroundColor: color,
    border: `2px solid ${
      selected ? 'rgb(132,63,255)' : theme.colors.popover.background
    } `,
    borderRadius: '4px',
    cursor: 'pointer',
  }),
);

const GridSmall = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, 25px)',
  gap: '5px',
});

const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
}));

const RadioGroupContainer = styled.div({
  flex: '0 0 50px',
  display: 'flex',
  alignItems: 'stretch',
});

type SwatchLayout = 'list' | 'grid';

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
            <Square color={colorString} />
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
            color={colorString}
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
  const [swatchLayout, setSwatchLayout] = useState<SwatchLayout>('grid');

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
          <RadioGroupContainer>
            <RadioGroup.Root
              id={'colors-layout'}
              value={swatchLayout}
              onValueChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setSwatchLayout(event.target.value as SwatchLayout)
              }
            >
              <RadioGroup.Item value="grid" tooltip="Grid">
                <GridIcon />
              </RadioGroup.Item>
              <RadioGroup.Item value="list" tooltip="List">
                <RowsIcon />
              </RadioGroup.Item>
            </RadioGroup.Root>
          </RadioGroupContainer>
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
