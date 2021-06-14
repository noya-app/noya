import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Spacer, sketchColorToRgbaString, ListView } from 'noya-designsystem';
import { memo } from 'react';
import styled from 'styled-components';

const PaddedSection = styled.section({
  padding: '10px',
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
  swatchLayout: 'grid' | 'list';
  sharedSwatches: Sketch.Swatch[];
  onChange: (color: Sketch.Color) => void;
}

export default memo(function ColorPickerSwatches({
  swatchID,
  swatchLayout,
  sharedSwatches,
  onChange,
}: Props) {
  return (
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
  );
});
