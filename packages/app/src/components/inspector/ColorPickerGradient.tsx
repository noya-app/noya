import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { GridIcon, RowsIcon } from '@radix-ui/react-icons';
import {
  Spacer,
  RadioGroup,
  Select,
  ListView,
  Button,
  Divider,
  getGradientBackground,
} from 'noya-designsystem';
import { memo, useState } from 'react';
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
    background: color,
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
  gradients: Sketch.GradientAsset[];
  onSelectGradientAsset: (gradient: Sketch.Gradient) => void;
}

const SwatchesList = memo(function SwatchesList({
  selectedSwatchId,
  gradients,
  onSelectGradientAsset,
}: SwatchesProps) {
  return (
    <ListView.Root>
      {gradients.map(({ do_objectID, gradient, name }) => {
        const colorString = getGradientBackground(
          gradient.stops,
          gradient.gradientType,
          180,
        );

        return (
          <ListView.Row
            id={do_objectID}
            key={do_objectID}
            selected={selectedSwatchId === do_objectID}
            onClick={() => {
              onSelectGradientAsset(gradient);
            }}
          >
            <Square color={colorString} />
            <Spacer.Horizontal size={8} />
            {name}
          </ListView.Row>
        );
      })}
    </ListView.Root>
  );
});

const SwatchesGrid = memo(function SwatchesGrid({
  selectedSwatchId,
  gradients,
  onSelectGradientAsset,
}: SwatchesProps) {
  return (
    <GridSmall>
      {gradients.map(({ do_objectID, gradient }) => {
        const colorString = getGradientBackground(
          gradient.stops,
          gradient.gradientType,
          180,
        );

        return (
          <Square
            key={do_objectID}
            color={colorString}
            selected={selectedSwatchId === do_objectID}
            onClick={() => {
              onSelectGradientAsset(gradient);
            }}
          />
        );
      })}
    </GridSmall>
  );
});

interface Props {
  swatchID?: string;
  gradientAssets: Sketch.GradientAsset[];
  onChange?: (gradient: Sketch.Gradient) => void;
  onCreate: () => void;
}

export default memo(function ColorPickerSwatches({
  swatchID,
  gradientAssets,
  onChange,
  onCreate,
}: Props) {
  const [gradientLayout, setGradientLayout] = useState<SwatchLayout>('grid');

  if (!onChange) return null;

  return (
    <>
      <PaddedSection>
        <Button id={'crete-theme-gradient'} onClick={onCreate}>
          Create Theme Gradient
        </Button>
      </PaddedSection>
      <Divider />
      <PaddedSection>
        <Row>
          <Select
            id="gradient-category"
            options={['Document']}
            value="Document"
            onChange={() => {}}
          />
          <Spacer.Horizontal size={8} />
          <RadioGroupContainer>
            <RadioGroup.Root
              id={'gradients-layout'}
              value={gradientLayout}
              onValueChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setGradientLayout(event.target.value as SwatchLayout)
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
        {gradientLayout === 'grid' ? (
          <SwatchesGrid
            selectedSwatchId={swatchID}
            gradients={gradientAssets}
            onSelectGradientAsset={onChange}
          />
        ) : (
          <SwatchesList
            selectedSwatchId={swatchID}
            gradients={gradientAssets}
            onSelectGradientAsset={onChange}
          />
        )}
      </PaddedSection>
    </>
  );
});
