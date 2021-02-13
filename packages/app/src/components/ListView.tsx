import {
  Children,
  createContext,
  isValidElement,
  memo,
  ReactNode,
  useCallback,
  useContext,
} from 'react';
import styled, { CSSObject } from 'styled-components';
import { useHover } from '../hooks/useHover';

export type ListRowPosition = 'only' | 'first' | 'middle' | 'last';

const listReset: CSSObject = {
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  textIndent: 0,
  listStyleType: 'none',
};

type ListRowContextValue = {
  position: ListRowPosition;
  selectedPosition: ListRowPosition;
};

const ListRowContext = createContext<ListRowContextValue>({
  position: 'only',
  selectedPosition: 'only',
});

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
  selected = false,
}: ListViewRowProps) {
  const { position, selectedPosition } = useContext(ListRowContext);
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
  color: theme.colors.textMuted,
}));

interface ListViewRootProps {
  children?: ReactNode;
  onClick?: () => void;
}

const getDisplayName = (type: any): string | undefined => {
  try {
    return type.displayName;
  } catch {
    return undefined;
  }
};

function ListViewRoot({ onClick, children }: ListViewRootProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      onClick?.();
    },
    [onClick],
  );

  const flattened = Children.toArray(children);

  const mappedChildren = flattened.map((current, i) => {
    const prev = flattened[i - 1];
    const next = flattened[i + 1];

    if (!isValidElement(current)) return current;

    // We determine section headers by displayName - using a function is simpler
    // but doesn't preserve across hot reloads.
    const nextItem =
      isValidElement(next) &&
      getDisplayName(next.type) !== SectionHeader.displayName
        ? next
        : undefined;
    const prevItem =
      isValidElement(prev) &&
      getDisplayName(prev.type) !== SectionHeader.displayName
        ? prev
        : undefined;

    let position: ListRowPosition = 'only';
    let selectedPosition: ListRowPosition = 'only';

    if (nextItem && prevItem) {
      position = 'middle';
    } else if (nextItem && !prevItem) {
      position = 'first';
    } else if (!nextItem && prevItem) {
      position = 'last';
    }

    if (current.props.selected) {
      const nextSelected = nextItem && nextItem.props.selected;
      const prevSelected = prevItem && prevItem.props.selected;

      if (nextSelected && prevSelected) {
        selectedPosition = 'middle';
      } else if (nextSelected && !prevSelected) {
        selectedPosition = 'first';
      } else if (!nextSelected && prevSelected) {
        selectedPosition = 'last';
      }
    }

    const contextValue = { position, selectedPosition };

    return (
      <ListRowContext.Provider key={current.key} value={contextValue}>
        {current}
      </ListRowContext.Provider>
    );
  });

  return <RootContainer onClick={handleClick}>{mappedChildren}</RootContainer>;
}

export const Row = memo(ListViewRow);
export const SectionHeader = memo(ListViewSectionHeader);
SectionHeader.displayName = 'SectionHeaderMemoized';
export const Root = memo(ListViewRoot);
