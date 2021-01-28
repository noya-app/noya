import { memo, ReactNode } from 'react';
import styled from 'styled-components';

/* ----------------------------------------------------------------------------
 * Separator
 * ------------------------------------------------------------------------- */

const SeparatorContainer = styled.div<{ selected: boolean }>(
  ({ theme, selected }) => ({
    height: '1px',
    background: selected ? '#648bdd' : theme.colors.divider,
  }),
);

interface ListViewSeparatorProps {
  selected?: boolean;
}

function ListViewSeparator({ selected = false }: ListViewSeparatorProps) {
  return <SeparatorContainer selected={selected} />;
}

/* ----------------------------------------------------------------------------
 * Spacer
 * ------------------------------------------------------------------------- */

const SpacerContainer = styled.div(({ theme }) => ({
  height: '3px',
}));

function ListViewSpacer() {
  return <SpacerContainer />;
}

/* ----------------------------------------------------------------------------
 * Row
 * ------------------------------------------------------------------------- */

const RowContainer = styled.div<{ selected: boolean }>(
  ({ theme, selected }) => ({
    ...theme.textStyles.small,
    cursor: 'pointer',
    borderRadius: '8px',
    paddingTop: '8px',
    paddingRight: '12px',
    paddingBottom: '8px',
    paddingLeft: '12px',
    marginLeft: '8px',
    marginRight: '8px',
    ...(selected && {
      color: 'white',
      backgroundColor: theme.colors.primary,
    }),
  }),
);

interface ListViewRowProps {
  children?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}

function ListViewRow({
  children,
  onClick,
  selected = false,
}: ListViewRowProps) {
  return (
    <RowContainer onClick={onClick} selected={selected}>
      {children}
    </RowContainer>
  );
}

/* ----------------------------------------------------------------------------
 * SectionHeader
 * ------------------------------------------------------------------------- */

const SectionHeaderContainer = styled.div<{ selected: boolean }>(
  ({ theme, selected }) => ({
    ...theme.textStyles.small,
    cursor: 'pointer',
    paddingTop: '8px',
    paddingRight: '20px',
    paddingBottom: '8px',
    paddingLeft: '20px',
    ...(selected && {
      color: 'white',
      backgroundColor: theme.colors.primary,
    }),
  }),
);

function ListViewSectionHeader({
  children,
  onClick,
  selected = false,
}: ListViewRowProps) {
  return (
    <SectionHeaderContainer onClick={onClick} selected={selected}>
      {children}
    </SectionHeaderContainer>
  );
}

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const RootContainer = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  backgroundColor: 'white',
  flex: '0 0 260px',
  borderRight: `1px solid ${theme.colors.divider}`,
}));

interface ListViewRootProps {
  children?: ReactNode;
}

function ListViewRoot({ children }: ListViewRootProps) {
  return <RootContainer>{children}</RootContainer>;
}

export const Row = memo(ListViewRow);
export const SectionHeader = memo(ListViewSectionHeader);
export const Separator = memo(ListViewSeparator);
export const Spacer = memo(ListViewSpacer);
export const Root = memo(ListViewRoot);
