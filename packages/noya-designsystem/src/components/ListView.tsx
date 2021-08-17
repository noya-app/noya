import { composeRefs } from '@radix-ui/react-compose-refs';
import { range } from 'noya-utils';
import {
  Children,
  createContext,
  ForwardedRef,
  forwardRef,
  isValidElement,
  memo,
  ReactNode,
  Ref,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import styled, { CSSObject } from 'styled-components';
import { InputField, Spacer } from '..';
import { useHover } from '../hooks/useHover';
import ContextMenu from './ContextMenu';
import { MenuItem } from './internal/Menu';
import ScrollArea from './ScrollArea';
import * as Sortable from './Sortable';

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
  sortable: boolean;
  expandable: boolean;
  indentation: number;
};

export const ListRowContext = createContext<ListRowContextValue>({
  position: 'only',
  selectedPosition: 'only',
  sortable: false,
  expandable: true,
  indentation: 12,
});

/* ----------------------------------------------------------------------------
 * RowTitle
 * ------------------------------------------------------------------------- */

const ListViewRowTitle = styled.span(({ theme }) => ({
  flex: '1 1 0',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'pre',
}));

/* ----------------------------------------------------------------------------
 * EditableRowTitle
 * ------------------------------------------------------------------------- */

interface EditableRowProps {
  value: string;
  onSubmitEditing: (value: string, reset: () => void) => void;
  autoFocus: boolean;
}

function ListViewEditableRowTitle({
  value,
  onSubmitEditing,
  autoFocus,
}: EditableRowProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    const element = inputRef.current;

    if (!element || !autoFocus) return;

    // Calling `focus` is necessary, in addition to `select`, to ensure
    // the `onBlur` fires correctly.
    element.focus();

    setTimeout(() => {
      element.select();
    }, 0);
  }, [autoFocus]);

  return (
    <InputField.Input
      ref={inputRef}
      variant="bare"
      value={value}
      onSubmit={onSubmitEditing}
      onClick={(e) => {
        e.stopPropagation();
      }}
    />
  );
}

/* ----------------------------------------------------------------------------
 * Row
 * ------------------------------------------------------------------------- */

const RowContainer = styled.li<{
  position: ListRowPosition;
  selected: boolean;
  selectedPosition: ListRowPosition;
  disabled: boolean;
  hovered: boolean;
  isSectionHeader: boolean;
}>(
  ({
    theme,
    position,
    selected,
    selectedPosition,
    disabled,
    hovered,
    isSectionHeader,
  }) => ({
    ...listReset,
    ...theme.textStyles.small,
    ...(isSectionHeader && { fontWeight: 500 }),
    flex: '0 0 auto',
    userSelect: 'none',
    cursor: 'default',
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
    color: theme.colors.textMuted,
    ...(isSectionHeader && {
      backgroundColor: theme.colors.listView.raisedBackground,
    }),
    ...(disabled && {
      color: theme.colors.textDisabled,
    }),
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
      !isSectionHeader &&
      (selectedPosition === 'middle' || selectedPosition === 'last') && {
        borderTopRightRadius: '0px',
        borderTopLeftRadius: '0px',
      }),
    ...(selected &&
      !isSectionHeader &&
      (selectedPosition === 'middle' || selectedPosition === 'first') && {
        borderBottomRightRadius: '0px',
        borderBottomLeftRadius: '0px',
      }),
    position: 'relative',
    ...(hovered && {
      boxShadow: `0 0 0 1px ${theme.colors.primary}`,
    }),
  }),
);

export const DragIndicatorElement = styled.div<{
  relativeDropPosition: Sortable.RelativeDropPosition;
  offsetLeft: number;
}>(({ theme, relativeDropPosition, offsetLeft }) => ({
  zIndex: 1,
  position: 'absolute',
  borderRadius: '3px',
  ...(relativeDropPosition === 'inside'
    ? {
        inset: 2,
        boxShadow: `0 0 0 1px ${theme.colors.sidebar.background}, 0 0 0 3px ${theme.colors.dragOutline}`,
      }
    : {
        top: relativeDropPosition === 'above' ? -3 : undefined,
        bottom: relativeDropPosition === 'below' ? -3 : undefined,
        left: offsetLeft,
        right: 0,
        height: 6,
        background: theme.colors.primary,
        border: `2px solid white`,
        boxShadow: '0 0 2px rgba(0,0,0,0.5)',
      }),
}));

export interface ListViewClickInfo {
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface ListViewRowProps<MenuItemType extends string = string> {
  id?: string;
  selected?: boolean;
  depth?: number;
  disabled?: boolean;
  hovered?: boolean;
  sortable?: boolean;
  onClick?: (info: ListViewClickInfo) => void;
  onDoubleClick?: () => void;
  onHoverChange?: (isHovering: boolean) => void;
  children?: ReactNode;
  isSectionHeader?: boolean;
  menuItems?: MenuItem<MenuItemType>[];
  onSelectMenuItem?: (value: MenuItemType) => void;
  onContextMenu?: () => void;
}

const ListViewRow = forwardRef(function ListViewRow<
  MenuItemType extends string
>(
  {
    id,
    selected = false,
    depth = 0,
    disabled = false,
    hovered = false,
    isSectionHeader = false,
    onClick,
    onDoubleClick,
    onHoverChange,
    children,
    menuItems,
    onContextMenu,
    onSelectMenuItem,
  }: ListViewRowProps<MenuItemType>,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const { position, selectedPosition, sortable, indentation } = useContext(
    ListRowContext,
  );
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

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      onDoubleClick?.();
    },
    [onDoubleClick],
  );

  const renderContent = (
    {
      relativeDropPosition,
      ...renderProps
    }: React.ComponentProps<typeof RowContainer> & {
      relativeDropPosition?: Sortable.RelativeDropPosition;
    },
    ref: Ref<HTMLElement>,
  ) => {
    const element = (
      <RowContainer
        ref={ref}
        onContextMenu={onContextMenu}
        isSectionHeader={isSectionHeader}
        id={id}
        {...hoverProps}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        position={position}
        disabled={disabled}
        hovered={hovered}
        selected={selected}
        selectedPosition={selectedPosition}
        aria-selected={selected}
        {...renderProps}
      >
        {relativeDropPosition && (
          <DragIndicatorElement
            relativeDropPosition={relativeDropPosition}
            offsetLeft={33 + depth * indentation}
          />
        )}
        {depth > 0 && <Spacer.Horizontal size={depth * indentation} />}
        {children}
      </RowContainer>
    );

    if (menuItems) {
      return (
        <ContextMenu<MenuItemType>
          items={menuItems}
          onSelect={onSelectMenuItem}
        >
          {element}
        </ContextMenu>
      );
    }

    return element;
  };

  if (sortable && id) {
    return (
      <Sortable.Item<HTMLElement> id={id}>
        {({ ref: sortableRef, ...sortableProps }) =>
          renderContent(sortableProps, composeRefs(sortableRef, forwardedRef))
        }
      </Sortable.Item>
    );
  }

  return renderContent({}, forwardedRef);
});

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const RootContainer = styled.ul<{ scrollable?: boolean }>(
  ({ theme, scrollable }) => ({
    ...listReset,
    flex: scrollable ? '1 0 0' : '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    color: theme.colors.textMuted,
  }),
);

export type ItemInfo = {
  isDragging: boolean;
};

type ChildrenProps<T> =
  | {
      children: ReactNode;
    }
  | {
      items: T[];
      renderItem: (item: T, index: number, info: ItemInfo) => ReactNode;
      getItemKey: (item: T) => string;
      sortable?: boolean;
    };

type ListViewRootProps<T> = ChildrenProps<T> & {
  onClick?: () => void;
  scrollable?: boolean;
  expandable?: boolean;
  onMoveItem?: (
    sourceIndex: number,
    destinationIndex: number,
    position: Sortable.RelativeDropPosition,
  ) => void;
  indentation?: number;
  acceptsDrop?: Sortable.DropValidator;
};

function ListViewRoot<T = any>({
  onClick,
  scrollable = false,
  expandable = true,
  onMoveItem,
  indentation = 12,
  acceptsDrop,
  ...props
}: ListViewRootProps<T>) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      onClick?.();
    },
    [onClick],
  );

  const sortable = 'sortable' in props && props.sortable === true;

  const ids: string[] =
    'items' in props ? props.items.map(props.getItemKey) : [];

  const childrenLength =
    'items' in props ? props.items.length : Children.count(props.children);

  const getChild = (index: number): ReactNode =>
    'items' in props
      ? props.renderItem(props.items[index], index, { isDragging: false })
      : Children.toArray(props.children)[index];

  const getWrappedChild = (i: number) => {
    const current = getChild(i);

    if (!isValidElement(current)) return current;

    const prev = i - 1 >= 0 && getChild(i - 1);
    const next = i + 1 < childrenLength && getChild(i + 1);

    const nextItem =
      isValidElement(next) && !next.props.isSectionHeader ? next : undefined;
    const prevItem =
      isValidElement(prev) && !prev.props.isSectionHeader ? prev : undefined;

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

    const contextValue = {
      position,
      selectedPosition,
      sortable,
      expandable,
      indentation,
    };

    return (
      <ListRowContext.Provider key={current.key} value={contextValue}>
        {current}
      </ListRowContext.Provider>
    );
  };

  const renderItem = 'items' in props ? props.renderItem : undefined;
  const items = 'items' in props ? props.items : undefined;

  const renderOverlay = useMemo(
    () =>
      renderItem && items
        ? (index: number) =>
            renderItem(items[index], index, {
              isDragging: true,
            })
        : undefined,
    [renderItem, items],
  );

  const wrappedChildren = range(0, childrenLength).map(getWrappedChild);

  const content = sortable ? (
    <Sortable.Root
      onMoveItem={onMoveItem}
      keys={ids}
      renderOverlay={renderOverlay}
      acceptsDrop={acceptsDrop}
    >
      {wrappedChildren}
    </Sortable.Root>
  ) : (
    wrappedChildren
  );

  const scrollableContent = scrollable ? (
    <ScrollArea>{content}</ScrollArea>
  ) : (
    content
  );

  return (
    <RootContainer onClick={handleClick} scrollable={scrollable}>
      {scrollableContent}
    </RootContainer>
  );
}

export const RowTitle = memo(ListViewRowTitle);
export const EditableRowTitle = memo(ListViewEditableRowTitle);
export const Row = memo(ListViewRow);
export const Root = memo(ListViewRoot);
