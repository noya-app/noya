import React, { memo, useCallback } from 'react';
import styled from 'styled-components';
import { View } from 'react-native';

import { RadioGroup, Layout } from 'noya-designsystem';
import type { LayoutType } from './types';

export const Square = styled(View)<{ background?: string; selected?: boolean }>(
  ({ theme, background, selected = false }) => ({
    height: 25,
    width: 25,
    backgroundColor: background,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    borderWidth: 2,
    borderColor: selected
      ? 'rgb(132, 63, 255)'
      : theme.colors.popover.background,
    borderRadius: 4,
  }),
);

export const GridSmall = styled(View)({
  flexWrap: 'wrap',
});

// TODO: test and verify after implementing
// mobile theme editor
export const RadioGroupContainer = styled(View)({
  alignItems: 'stretch',
  flexBasis: 50,
  flexShrink: 0,
  flexGrow: 0,
});

// TODO: test and verify after implementing
// mobile theme editor
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
