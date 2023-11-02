import { Spacer } from 'noya-designsystem';
import React, { CSSProperties, memo, ReactNode } from 'react';
import styled, { useTheme } from 'styled-components';

export const Section = styled.div(({ theme }) => ({
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'column',
  padding: '10px',
}));

export const SectionHeader = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

export const Title = styled.div<{
  textStyle?: 'small' | 'heading5' | 'heading4' | 'heading3';
}>(({ theme, textStyle }) => ({
  display: 'flex',
  flexDirection: 'row',
  userSelect: 'none',

  ...(textStyle
    ? {
        ...theme.textStyles[textStyle],
      }
    : {
        ...theme.textStyles.label,
        color: theme.colors.textSubtle,
        fontWeight: 'bold',
      }),
}));

export const Row = styled.div<{ gap?: CSSProperties['gap'] }>(
  ({ theme, gap }) => ({
    flex: '1',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap,
  }),
);

export const Column = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
}));

export const Checkbox = styled.input(({ theme }) => ({
  margin: 0,
}));

export const Text = styled.span(({ theme }) => ({
  ...theme.textStyles.small,
}));

export const VerticalSeparator = () => (
  <Spacer.Vertical size={useTheme().sizes.inspector.verticalSeparator} />
);

export const HorizontalSeparator = () => (
  <Spacer.Horizontal size={useTheme().sizes.inspector.horizontalSeparator} />
);

const SliderRowLabel = styled.span(({ theme }) => ({
  ...theme.textStyles.small,
  color: theme.colors.textMuted,
  marginBottom: '-6px',
}));

const RowLabel = styled.span<{
  textStyle?: 'small' | 'heading5' | 'heading4' | 'heading3';
}>(({ theme, textStyle }) => ({
  marginBottom: '6px',
  display: 'flex',
  ...(textStyle
    ? {
        ...theme.textStyles[textStyle],
      }
    : {
        ...theme.textStyles.label,
        color: theme.colors.textSubtle,
        fontWeight: 'bold',
      }),
}));

export const LabeledRow = memo(function LabeledRow({
  children,
  label,
  labelTextStyle,
  gap,
  right,
}: {
  children: ReactNode;
  label: string;
  labelTextStyle?: 'small' | 'heading5' | 'heading4' | 'heading3';
  gap?: CSSProperties['gap'];
  right?: ReactNode;
}) {
  return (
    <Row>
      <Column>
        <RowLabel textStyle={labelTextStyle}>
          {label}
          {right && <Spacer.Horizontal />}
          {right}
        </RowLabel>
        <Row gap={gap}>{children}</Row>
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
