import { memo, ReactNode } from 'react';
import styled from 'styled-components';

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
  ...theme.textStyles.small,
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
