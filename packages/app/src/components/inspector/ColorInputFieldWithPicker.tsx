import { GridIcon, RowsIcon } from '@radix-ui/react-icons';
import * as Popover from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import type Sketch from '@sketch-hq/sketch-file-format-ts';
import {
  ColorInputField,
  Divider,
  RadioGroup,
  Select,
  Spacer,
} from 'noya-designsystem';
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

type SwatchLayout = 'list' | 'grid';

interface Props {
  id?: string;
  value: Sketch.Color;
  onChange: (color: Sketch.Color) => void;
}

export default memo(function ColorInputFieldWithPicker({
  id,
  value,
  onChange,
}: Props) {
  // TODO: The value prop here can be an array, and other
  // inspector rows may also take arrays
  const values = useMemo(() => [value], [value]);

  const [swatchLayout, setSwatchLayout] = useState<SwatchLayout>('grid');

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
        <StyledArrow />
      </Content>
    </Popover.Root>
  );
});
