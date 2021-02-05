import { memo, ReactNode, useCallback } from 'react';
import styled, { CSSObject } from 'styled-components';

export type ListRowPosition = 'only' | 'first' | 'middle' | 'last';

const listReset: CSSObject = {
  margin: 0,
  padding: 0,
  textIndent: 0,
  listStyleType: 'none',
};

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

const RowContainer = styled.li<{
  selected: boolean;
  position: ListRowPosition;
}>(({ theme, selected, position }) => ({
  ...listReset,
  ...theme.textStyles.small,
  userSelect: 'none',
  cursor: 'pointer',
  borderTopRightRadius: '4px',
  borderTopLeftRadius: '4px',
  borderBottomRightRadius: '4px',
  borderBottomLeftRadius: '4px',
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
  ...(selected &&
    (position === 'middle' || position === 'last') && {
      borderTopRightRadius: '0px',
      borderTopLeftRadius: '0px',
    }),
  ...(selected &&
    (position === 'middle' || position === 'first') && {
      borderBottomRightRadius: '0px',
      borderBottomLeftRadius: '0px',
    }),
}));

export interface ListViewClickInfo {
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

interface ListViewRowProps {
  children?: ReactNode;
  selected?: boolean;
  position?: ListRowPosition;
  onClick?: (info: ListViewClickInfo) => void;
}

function ListViewRow({
  children,
  onClick,
  selected = false,
  position = 'only',
}: ListViewRowProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      onClick?.(event);
    },
    [onClick],
  );

  return (
    <RowContainer
      onClick={handleClick}
      selected={selected}
      position={position}
      aria-selected={selected}
    >
      {children}
    </RowContainer>
  );
}

/* ----------------------------------------------------------------------------
 * SectionHeader
 * ------------------------------------------------------------------------- */

const SectionHeaderContainer = styled.li<{ selected: boolean }>(
  ({ theme, selected }) => ({
    ...listReset,
    ...theme.textStyles.small,
    userSelect: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    paddingTop: '6px',
    paddingRight: '20px',
    paddingBottom: '6px',
    paddingLeft: '20px',
    borderBottom: `1px solid ${
      selected ? theme.colors.primaryDark : theme.colors.divider
    }`,
    backgroundColor: 'rgba(255,255,255,0.9)',
    ...(selected && {
      color: 'white',
      backgroundColor: theme.colors.primary,
    }),
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px',
    marginBottom: '8px',
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

      onClick?.(event);
    },
    [onClick],
  );

  return (
    <SectionHeaderContainer
      onClick={handleClick}
      selected={selected}
      aria-selected={selected}
    >
      {children}
    </SectionHeaderContainer>
  );
}

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const RootContainer = styled.ul(({ theme }) => ({
  ...listReset,
  flex: '1',
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  paddingTop: '8px',
  paddingBottom: '8px',
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
