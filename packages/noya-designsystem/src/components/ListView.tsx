import { composeRefs } from '@radix-ui/react-compose-refs';
import { Size } from 'noya-geometry';
import { range } from 'noya-utils';
import {
  Children,
  createContext,
  CSSProperties,
  ForwardedRef,
  forwardRef,
  isValidElement,
  memo,
  ReactElement,
  ReactNode,
  Ref,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { List, WindowScroller } from 'react-virtualized';
import styled from 'styled-components';
import { InputField, Spacer } from '..';
import { useHover } from '../hooks/useHover';
import ContextMenu from './ContextMenu';
import { MenuItem } from './internal/Menu';
import ScrollArea from './ScrollArea';
import * as Sortable from './Sortable';

export type ListRowPosition = 'only' | 'first' | 'middle' | 'last';

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

function getPositionMargin(position: ListRowPosition) {
  // return { top: 0, bottom: 0 };

  return {
    top: position === 'first' || position === 'only' ? 8 : 0,
    bottom: position === 'last' || position === 'only' ? 8 : 0,
  };
}

/* ----------------------------------------------------------------------------
 * Row
 * ------------------------------------------------------------------------- */

const RowContainer = styled.div<{
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
  }) => {
    const positionMargin = getPositionMargin(position);

    return {
      ...theme.textStyles.small,
      ...(isSectionHeader && { fontWeight: 500 }),
      flex: '0 0 auto',
      userSelect: 'none',
      cursor: 'default',
      borderRadius: '4px',
      paddingTop: '6px',
      paddingRight: '12px',
      paddingBottom: '6px',
      paddingLeft: '12px',
      marginLeft: '8px',
      marginRight: '8px',
      marginTop: `${positionMargin.top}px`,
      marginBottom: `${positionMargin.bottom}px`,
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
    };
  },
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
 * VirtualizedList
 * ------------------------------------------------------------------------- */

interface VirtualizedListProps<T> {
  size: Size;
  scrollElement: HTMLDivElement;
  items: T[];
  getItemHeight: (index: number) => number;
  renderItem: (index: number) => ReactNode;
}

const VirtualizedList = memo(function VirtualizedList<T>({
  size,
  scrollElement,
  items,
  getItemHeight,
  renderItem,
}: VirtualizedListProps<T>) {
  const [virtualizedListViewKey, setVirtualizedListViewKey] = useState(0);

  useLayoutEffect(() => {
    setVirtualizedListViewKey((key) => key + 1);
  }, [
    // When items change, we need to re-render the virtualized list,
    // since it doesn't currently support row height changes
    items,
  ]);

  // Internally, react-virtualized updates these properties. We always want
  // to use our custom scroll element, so we override them. It may update
  // overflowX/Y individually in addition to `overflow`, so we include all 3.
  const listStyle = useMemo(
    (): CSSProperties => ({
      overflowX: 'initial',
      overflowY: 'initial',
      overflow: 'initial',
    }),
    [],
  );

  const onRowHeight = useCallback(
    ({ index }: { index: number }) => getItemHeight(index),
    [getItemHeight],
  );

  const onRowRender = useCallback(
    ({
      index,
      style,
      key,
    }: {
      index: number;
      style: CSSProperties;
      key: string;
    }) => (
      <div key={key} style={style}>
        {renderItem(index)}
      </div>
    ),
    [renderItem],
  );

  return (
    <WindowScroller
      scrollElement={scrollElement}
      style={useMemo(() => ({ flex: '1 1 auto' }), [])}
    >
      {useCallback(
        ({ isScrolling, registerChild, onChildScroll, scrollTop }) => (
          <div ref={registerChild}>
            <List
              id="my-list"
              key={virtualizedListViewKey}
              style={listStyle}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              scrollTop={scrollTop}
              width={size.width}
              height={size.height}
              rowCount={items.length}
              rowHeight={onRowHeight}
              rowRenderer={onRowRender}
            />
          </div>
        ),
        [
          onRowHeight,
          onRowRender,
          items.length,
          listStyle,
          size.height,
          size.width,
          virtualizedListViewKey,
        ],
      )}
    </WindowScroller>
  );
});

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const RootContainer = styled.div<{ scrollable?: boolean }>(
  ({ theme, scrollable }) => ({
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

type ChildrenProps = {
  children: ReactNode;
};

type RenderProps<T> = {
  items: T[];
  renderItem: (item: T, index: number, info: ItemInfo) => ReactNode;
  getItemKey: (item: T, index: number) => string;
  sortable?: boolean;
  virtualized?: Size;
};

type ListViewRootProps = {
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

const ListViewRoot = memo(function ListViewRoot<T>({
  onClick,
  scrollable = false,
  expandable = true,
  sortable = false,
  onMoveItem,
  indentation = 12,
  acceptsDrop,
  items,
  renderItem,
  getItemKey,
  virtualized,
}: RenderProps<T> & ListViewRootProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      onClick?.();
    },
    [onClick],
  );

  const renderChild = useCallback(
    (index: number) => renderItem(items[index], index, { isDragging: false }),
    [items, renderItem],
  );

  const renderOverlay = useCallback(
    (index: number) => renderItem(items[index], index, { isDragging: true }),
    [renderItem, items],
  );

  const getItemContextValue = useCallback(
    (i: number): ListRowContextValue | undefined => {
      const current = renderChild(i);

      if (!isValidElement(current)) return;

      const prev = i - 1 >= 0 && renderChild(i - 1);
      const next = i + 1 < items.length && renderChild(i + 1);

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

      return {
        position,
        selectedPosition,
        sortable,
        expandable,
        indentation,
      };
    },
    [expandable, renderChild, indentation, items.length, sortable],
  );

  const renderWrappedChild = useCallback(
    (index: number) => {
      const contextValue = getItemContextValue(index);
      const current = renderChild(index);

      if (!contextValue || !isValidElement(current)) return null;

      return (
        <ListRowContext.Provider key={current.key} value={contextValue}>
          {current}
        </ListRowContext.Provider>
      );
    },
    [getItemContextValue, renderChild],
  );

  const ids = useMemo(() => items.map(getItemKey), [getItemKey, items]);

  const withSortable = (children: ReactNode) =>
    sortable ? (
      <Sortable.Root
        onMoveItem={onMoveItem}
        keys={ids}
        renderOverlay={renderOverlay}
        acceptsDrop={acceptsDrop}
      >
        {children}
      </Sortable.Root>
    ) : (
      children
    );

  const withScrollable = (
    children: (scrollElementRef: HTMLDivElement | null) => ReactNode,
  ) => (scrollable ? <ScrollArea>{children}</ScrollArea> : children(null));

  const getItemHeight = useCallback(
    (index: number) => {
      const child = getItemContextValue(index);
      const margin = child?.position
        ? getPositionMargin(child.position)
        : { top: 0, bottom: 0 };
      const height = margin.top + 31 + margin.bottom;
      return height;
    },
    [getItemContextValue],
  );

  return (
    <RootContainer onClick={handleClick} scrollable={scrollable}>
      {withScrollable((scrollElementRef: HTMLDivElement | null) =>
        withSortable(
          virtualized ? (
            <VirtualizedList
              scrollElement={scrollElementRef!}
              items={items}
              size={virtualized}
              getItemHeight={getItemHeight}
              renderItem={renderWrappedChild}
            />
          ) : (
            range(0, items.length).map(renderWrappedChild)
          ),
        ),
      )}
    </RootContainer>
  );
});

const ChildrenListView = memo(function ChildrenListView({
  children,
  ...rest
}: ChildrenProps & ListViewRootProps) {
  const items: ReactElement[] = useMemo(
    () =>
      Children.toArray(children).flatMap((child) =>
        isValidElement(child) ? [child] : [],
      ),
    [children],
  );

  return (
    <ListViewRoot
      {...rest}
      items={items}
      getItemKey={useCallback(
        ({ key }: { key: string | number | null }, index: number) =>
          typeof key === 'string' ? key : (key ?? index).toString(),
        [],
      )}
      renderItem={useCallback((item: ReactElement) => item, [])}
    />
  );
});

/**
 * A ListView can be created either with `children` or render props
 */
const SimpleListView = memo(function SimpleListView<T = any>(
  props: (ChildrenProps | RenderProps<T>) & ListViewRootProps,
) {
  if ('children' in props) {
    return <ChildrenListView {...props} />;
  } else {
    return <ListViewRoot {...props} />;
  }
});

export const RowTitle = memo(ListViewRowTitle);
export const EditableRowTitle = memo(ListViewEditableRowTitle);
export const Row = memo(ListViewRow);
export const Root = memo(SimpleListView);
