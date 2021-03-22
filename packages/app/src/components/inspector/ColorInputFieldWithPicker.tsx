import { GridIcon, RowsIcon } from '@radix-ui/react-icons';
import * as Popover from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { useApplicationState } from '../../contexts/ApplicationStateContext';
import {
  ColorInputField,
  Divider,
  RadioGroup,
  Select,
  Spacer,
  sketchColorToRgbaString,
  ListView,
} from 'noya-designsystem';
import { getSharedSwatches } from 'noya-state/src/selectors';
import { memo, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import ColorInspector from './ColorInspector';

const Content = styled(Popover.Content)(({ theme }) => ({
  width: '240px',
  borderRadius: 4,
  fontSize: 14,
  backgroundColor: theme.colors.popover.background,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 12px rgba(0,0,0,0.1)',
  maxHeight: '600px',
  overflowY: 'auto',
}));

const StyledArrow = styled(Popover.Arrow)(({ theme }) => ({
  fill: theme.colors.popover.background,
}));

const PaddedSection = styled.section({
  padding: '10px',
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

type SwatchLayout = 'list' | 'grid';

interface Props {
  id?: string;
  value: Sketch.Color;
  onChange: (color: Sketch.Color) => void;
}

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

export default memo(function ColorInputFieldWithPicker({
  id,
  value,
  onChange,
}: Props) {
  // TODO: The value prop here can be an array, and other
  // inspector rows may also take arrays
  const values = useMemo(() => [value], [value]);

  const [state] = useApplicationState();

  const [swatchLayout, setSwatchLayout] = useState<SwatchLayout>('grid');

  const sharedSwatches = getSharedSwatches(state);

  return (
    <Popover.Root>
      <Popover.Trigger as={Slot}>
        <ColorInputField id={id} value={value} />
      </Popover.Trigger>
      <Content side="bottom" align="center">
        <PaddedSection>
          <ColorInspector
            id={`${id}-panel`}
            colors={values}
            onChangeColor={onChange}
          />
        </PaddedSection>
        <Divider />
        <PaddedSection>
          <Row>
            <Select
              id="colors-category"
              options={useMemo(() => ['Document colors'], [])}
              value="Document colors"
              onChange={useCallback(() => {}, [])}
            />
            <Spacer.Horizontal size={8} />
            <RadioGroupContainer>
              <RadioGroup.Root
                id={'colors-layout'}
                value={swatchLayout}
                onValueChange={useCallback(
                  (event: React.ChangeEvent<HTMLInputElement>) =>
                    setSwatchLayout(event.target.value as SwatchLayout),
                  [],
                )}
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
              selectedSwatchId={value.swatchID}
              swatches={sharedSwatches}
              onSelectSwatch={onChange}
            />
          ) : (
            <SwatchesList
              selectedSwatchId={value.swatchID}
              swatches={sharedSwatches}
              onSelectSwatch={onChange}
            />
          )}
        </PaddedSection>
        <StyledArrow />
      </Content>
    </Popover.Root>
  );
});
