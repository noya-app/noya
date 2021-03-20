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
  sketchColorToRgba,
  ListView,
} from 'noya-designsystem';
import { getSharedSwatches } from 'noya-state/src/selectors';
import { memo, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import ColorInspector from './ColorInspector';
import { hsvaToRgbaString, rgbaToHsva } from 'noya-colorpicker';

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

interface GridProps {
  id?: string;
  swatches: Sketch.Swatch[];
  layout: SwatchLayout;
  onClick: (color: Sketch.Color) => void;
}

const SwatchesSelector = memo(function SwatchesSelector({
  swatches,
  layout,
  onClick,
}: GridProps) {
  const [selected, setSelected] = useState<string>('');

  return (
    <>
      {layout === 'grid' && (
        <GridSmall>
          {swatches.map((item) => {
            const colorString = hsvaToRgbaString(
              rgbaToHsva(sketchColorToRgba(item.value)),
            );

            return (
              <Square
                key={item.do_objectID}
                color={colorString}
                selected={selected === item.do_objectID}
                onClick={() => {
                  onClick(item.value);
                  setSelected(item.do_objectID);
                }}
              />
            );
          })}
        </GridSmall>
      )}
      {layout === 'list' && (
        <ListView.Root>
          {swatches.map((item) => {
            const colorString = hsvaToRgbaString(
              rgbaToHsva(sketchColorToRgba(item.value)),
            );

            return (
              <ListView.Row
                id={item.do_objectID}
                key={item.do_objectID}
                selected={selected === item.do_objectID}
                onClick={() => {
                  onClick(item.value);
                  setSelected(item.do_objectID);
                }}
              >
                <Square color={colorString} />
                <Spacer.Horizontal size={8} />
                {item.name}
              </ListView.Row>
            );
          })}
        </ListView.Root>
      )}
    </>
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
        <Divider />
        <PaddedSection>
          <SwatchesSelector
            layout={swatchLayout}
            swatches={sharedSwatches}
            onClick={useCallback((color) => onChange(color), [onChange])}
          />
        </PaddedSection>
        <StyledArrow />
      </Content>
    </Popover.Root>
  );
});
