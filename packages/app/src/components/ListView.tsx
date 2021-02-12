import {
  Children,
  cloneElement,
  isValidElement,
  memo,
  ReactNode,
  useCallback,
} from 'react';
import styled, { CSSObject } from 'styled-components';
import { useHover } from '../hooks/useHover';

export type ListRowPosition = 'only' | 'first' | 'middle' | 'last';

const listReset: CSSObject = {
  margin: 0,
  padding: 0,
  textIndent: 0,
  listStyleType: 'none',
};

/* ----------------------------------------------------------------------------
 * Row
 * ------------------------------------------------------------------------- */

const RowContainer = styled.li<{
  position: ListRowPosition;
  selected: boolean;
  selectedPosition: ListRowPosition;
}>(({ theme, position, selected, selectedPosition }) => ({
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
  ...((position === 'first' || position === 'only') && {
    marginTop: '8px',
  }),
  ...((position === 'last' || position === 'only') && {
    marginBottom: '8px',
  }),
  ...(selected &&
    (selectedPosition === 'middle' || selectedPosition === 'last') && {
      borderTopRightRadius: '0px',
      borderTopLeftRadius: '0px',
    }),
  ...(selected &&
    (selectedPosition === 'middle' || selectedPosition === 'first') && {
      borderBottomRightRadius: '0px',
      borderBottomLeftRadius: '0px',
    }),
}));

export interface ListViewClickInfo {
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface ListViewRowProps {
  children?: ReactNode;
  position?: ListRowPosition;
  selected?: boolean;
  selectedPosition?: ListRowPosition;
  onClick?: (info: ListViewClickInfo) => void;
  onHoverChange?: (isHovering: boolean) => void;
}

function ListViewRow({
  children,
  onClick,
  onHoverChange,
  position = 'only',
  selected = false,
  selectedPosition = 'only',
}: ListViewRowProps) {
  const { hoverProps } = useHover({
    onHoverChange,
  });

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      onClick?.(event);
    },
    [onClick],
  );

  return (
    <RowContainer
      {...hoverProps}
      onClick={handleClick}
      position={position}
      selected={selected}
      selectedPosition={selectedPosition}
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
    backgroundColor: theme.colors.listView.raisedBackground,
    ...(selected && {
      color: 'white',
      backgroundColor: theme.colors.primary,
    }),
    display: 'flex',
    alignItems: 'center',
    // marginTop: '8px',
    // marginBottom: '8px',
  }),
);

function ListViewSectionHeader({
  children,
  onClick,
  onHoverChange,
  selected = false,
}: Omit<ListViewRowProps, 'position'>) {
  const { hoverProps } = useHover({
    onHoverChange,
  });

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      onClick?.(event);
    },
    [onClick],
  );

  return (
    <SectionHeaderContainer
      {...hoverProps}
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
  // paddingTop: '8px',
  // paddingBottom: '8px',
  color: theme.colors.textMuted,
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

  const flattened = Children.toArray(children);
  const mappedChildren: typeof flattened = [];

  for (let i = 0; i < flattened.length; i++) {
    const prev = flattened[i - 1];
    const current = flattened[i];
    const next = flattened[i + 1];

    if (!isValidElement(current)) {
      mappedChildren.push(current);
      continue;
    }

    const nextItem =
      isValidElement(next) && next.type !== SectionHeader ? next : undefined;
    const prevItem =
      isValidElement(prev) && prev.type !== SectionHeader ? prev : undefined;

    const cloneProps = { ...current.props };

    if (nextItem && prevItem) {
      cloneProps.position = 'middle';
    } else if (nextItem && !prevItem) {
      cloneProps.position = 'first';
    } else if (!nextItem && prevItem) {
      cloneProps.position = 'last';
    }

    if (cloneProps.selected) {
      const nextSelected = nextItem && nextItem.props.selected;
      const prevSelected = prevItem && prevItem.props.selected;

      if (nextSelected && prevSelected) {
        cloneProps.selectedPosition = 'middle';
      } else if (nextSelected && !prevSelected) {
        cloneProps.selectedPosition = 'first';
      } else if (!nextSelected && prevSelected) {
        cloneProps.selectedPosition = 'last';
      }
    }

    mappedChildren.push(cloneElement(current, cloneProps));
  }

  return <RootContainer onClick={handleClick}>{mappedChildren}</RootContainer>;
}

export const Row = memo(ListViewRow);
export const SectionHeader = memo(ListViewSectionHeader);
export const Root = memo(ListViewRoot);
