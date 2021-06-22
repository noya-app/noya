import { GridIcon, RowsIcon } from '@radix-ui/react-icons';
import { RadioGroup } from 'noya-designsystem';
import styled from 'styled-components';
import { memo, useCallback } from 'react';

export const PaddedSection = styled.section({
  padding: '8px 10px',
  display: 'flex',
  flexDirection: 'column',
});

export const Square = styled.div<{ background: string; selected?: boolean }>(
  ({ theme, background, selected = false }) => ({
    height: '25px',
    width: '25px',
    background,
    border: `2px solid ${
      selected ? 'rgb(132,63,255)' : theme.colors.popover.background
    } `,
    borderRadius: '4px',
    cursor: 'pointer',
  }),
);

export const GridSmall = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, 25px)',
  gap: '5px',
});

export const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
}));

export const RadioGroupContainer = styled.div({
  flex: '0 0 50px',
  display: 'flex',
  alignItems: 'stretch',
});

export type LayoutType = 'list' | 'grid';

export const LayoutPicker = memo(
  ({
    layout,
    setLayout,
  }: {
    layout: LayoutType;
    setLayout: (value: LayoutType) => void;
  }) => (
    <RadioGroupContainer>
      <RadioGroup.Root
        id={'layout'}
        value={layout}
        onValueChange={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) =>
            setLayout(event.target.value as LayoutType),
          [setLayout],
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
  ),
);
