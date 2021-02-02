import { memo, ReactNode, useCallback, useMemo } from 'react';
import styled from 'styled-components';

/* ----------------------------------------------------------------------------
 * Separator
 * ------------------------------------------------------------------------- */

const SeparatorContainer = styled.div<{ selected: boolean }>(
  ({ theme, selected }) => ({
    minHeight: '1px',
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
    borderRadius: '4px',
    paddingTop: '6px',
    paddingRight: '12px',
    paddingBottom: '6px',
    paddingLeft: '12px',
    marginLeft: '8px',
    marginRight: '8px',
    ...(selected && {
      color: 'white',
      backgroundColor: theme.colors.primary,
    }),
    display: 'flex',
    alignItems: 'center',
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
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      onClick?.();
    },
    [onClick],
  );

  return (
    <RowContainer onClick={handleClick} selected={selected}>
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
    fontWeight: 500,
    cursor: 'pointer',
    paddingTop: '6px',
    paddingRight: '20px',
    paddingBottom: '6px',
    paddingLeft: '20px',
    borderBottom: `1px solid ${
      selected ? theme.colors.primaryDark : theme.colors.divider
    }`,
    backgroundColor: 'white',
    ...(selected && {
      color: 'white',
      backgroundColor: theme.colors.primary,
    }),
    display: 'flex',
    alignItems: 'center',
  }),
);

function ListViewSectionHeader({
  children,
  onClick,
  selected = false,
}: ListViewRowProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      onClick?.();
    },
    [onClick],
  );

  return (
    <SectionHeaderContainer onClick={handleClick} selected={selected}>
      {children}
    </SectionHeaderContainer>
  );
}

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const RootContainer = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
}));

interface ListViewRootProps {
  children?: ReactNode;
  onClick?: () => void;
}

function ListViewRoot({ onClick, children }: ListViewRootProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      onClick?.();
    },
    [onClick],
  );

  return <RootContainer onClick={handleClick}>{children}</RootContainer>;
}

export const Row = memo(ListViewRow);
export const SectionHeader = memo(ListViewSectionHeader);
export const Separator = memo(ListViewSeparator);
export const Spacer = memo(ListViewSpacer);
export const Root = memo(ListViewRoot);
