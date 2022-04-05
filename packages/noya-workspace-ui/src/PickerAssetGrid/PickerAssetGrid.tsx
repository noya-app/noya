import { memo, useCallback } from 'react';
import styled from 'styled-components';

import { RadioGroup, Layout } from 'noya-designsystem';
import type { LayoutType } from './types';

export const Square = styled.div<{ background?: string; selected?: boolean }>(
  ({ theme, background, selected = false }) => ({
    height: '25px',
    width: '25px',
    background,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    border: `2px solid ${
      selected ? 'rgb(132,63,255)' : theme.colors.popover.background
    } `,
    borderRadius: '4px',
    cursor: 'pointer',
    position: 'relative',
  }),
);

export const GridSmall = styled.div({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, 25px)',
  gap: '5px',
});

export const RadioGroupContainer = styled.div({
  flex: '0 0 50px',
  display: 'flex',
  alignItems: 'stretch',
});

export const LayoutRadioGroup = memo(
  ({
    layout,
    setLayout,
  }: {
    layout: LayoutType;
    setLayout: (value: LayoutType) => void;
  }) => (
    <RadioGroupContainer>
      <RadioGroup.Root
        id="layout"
        value={layout}
        onValueChange={useCallback(
          (value: string) => setLayout(value as LayoutType),
          [setLayout],
        )}
      >
        <RadioGroup.Item value="grid" tooltip="Grid">
          <Layout.Icon name="grid" />
        </RadioGroup.Item>
        <RadioGroup.Item value="list" tooltip="List">
          <Layout.Icon name="rows" />
        </RadioGroup.Item>
      </RadioGroup.Root>
    </RadioGroupContainer>
  ),
);