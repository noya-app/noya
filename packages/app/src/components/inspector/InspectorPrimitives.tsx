import { Spacer } from 'noya-designsystem';
import { memo, ReactNode } from 'react';
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

export const Title = styled.div(({ theme }) => ({
  ...theme.textStyles.label,
  color: theme.colors.textSubtle,
  fontWeight: 'bold',
  display: 'flex',
  flexDirection: 'row',
  userSelect: 'none',
}));

export const Row = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

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

const RowLabel = styled.span(({ theme }) => ({
  ...theme.textStyles.small,
  color: theme.colors.textMuted,
  marginBottom: '2px',
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
