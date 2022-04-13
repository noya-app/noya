import React, { memo, ReactNode } from 'react';
import styled, { useTheme } from 'styled-components';
import { View, Text as RNText } from 'react-native';

import { Layout, Touchable, LabeledView } from 'noya-designsystem';

export const Section = styled(View)(({ theme }) => ({
  padding: 10,
}));

export const SectionHeader = styled(View)(({ theme }) => ({
  alignItems: 'center',
  flexDirection: 'row',
}));

export const Title = styled(RNText)(({ theme }) => ({
  ...theme.textStyles.label,
  color: theme.colors.textSubtle,
}));

export const Row = styled(View)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
}));

export const Column = styled(View)(({ theme }) => ({
  flex: 1,
}));

export const Text = styled(RNText)(({ theme }) => ({
  ...theme.textStyles.small,
}));

export const VerticalSeparator = () => (
  <Layout.Stack size={useTheme().sizes.inspector.verticalSeparator} />
);

export const HorizontalSeparator = () => (
  <Layout.Queue size={useTheme().sizes.inspector.horizontalSeparator} />
);

const SliderRowLabel = styled(RNText)(({ theme }) => ({
  ...theme.textStyles.small,
  color: theme.colors.textMuted,
  marginBottom: -6,
}));

const RowLabel = styled(RNText)(({ theme }) => ({
  ...theme.textStyles.small,
  color: theme.colors.textMuted,
  marginBottom: 4,
}));

export const LabeledRow = memo(function LabeledRow({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <Row>
      <Column>
        <RowLabel>{label}</RowLabel>
        <Row>{children}</Row>
      </Column>
    </Row>
  );
});

export const LabeledSliderRow = memo(function LabeledRow({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <Row>
      <Column>
        <SliderRowLabel>{label}</SliderRowLabel>
        <Row>{children}</Row>
      </Column>
    </Row>
  );
});

export const DragHandle = memo(function DragHandle() {
  return (
    <>
      <Touchable gestures={{}}>
        <LabeledView>
          <Layout.Icon name="drag-handle-dots-2" size={20} />
        </LabeledView>
      </Touchable>
      <HorizontalSeparator />
    </>
  );
});
