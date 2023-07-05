import { composeRefs } from '@radix-ui/react-compose-refs';
import { Size } from 'noya-geometry';
import { range } from 'noya-utils';
import React, {
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
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import { WindowScroller } from 'react-virtualized';
import { ListChildComponentProps, VariableSizeList } from 'react-window';
import styled from 'styled-components';
import { mergeEventHandlers } from '../hooks/mergeEventHandlers';
import { useHover } from '../hooks/useHover';
import { isLeftButtonClicked } from '../utils/mouseEvent';
import { ContextMenu } from './ContextMenu';
import { InputField } from './InputField';
import { MenuItem } from './internal/Menu';
import { ScrollArea } from './ScrollArea';
import { DropValidator, RelativeDropPosition, Sortable } from './Sortable';
import { Spacer } from './Spacer';

export type ListRowMarginType = 'none' | 'top' | 'bottom' | 'vertical';
export type ListRowPosition = 'only' | 'first' | 'middle' | 'last';

type PressEventName = 'onClick' | 'onPointerDown';

type ListRowContextValue = {
  marginType: ListRowMarginType;
  selectedPosition: ListRowPosition;
  sortable: boolean;
  expandable: boolean;
  divider: boolean;
  padded: boolean;
  indentation: number;
  pressEventName: PressEventName;
};

const ListRowContext = createContext<ListRowContextValue>({
  marginType: 'none',
  selectedPosition: 'only',
  sortable: false,
  expandable: true,
  divider: true,
  padded: false,
  indentation: 12,
  pressEventName: 'onClick',
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
  onSubmitEditing: (value: string) => void;
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
      allowSubmittingWithSameValue
    />
  );
}

function getPositionMargin(marginType: ListRowMarginType) {
  return {
    top: marginType === 'top' || marginType === 'vertical' ? 8 : 0,
    bottom: marginType === 'bottom' || marginType === 'vertical' ? 8 : 0,
  };
}

/* ----------------------------------------------------------------------------
 * Row
 * ------------------------------------------------------------------------- */

const RowContainer = styled.div<{
  marginType: ListRowMarginType;
  selected: boolean;
  selectedPosition: ListRowPosition;
  disabled: boolean;
  hovered: boolean;
  padded: boolean;
  divider: boolean;
  isSectionHeader: boolean;
  showsActiveState: boolean;
}>(
  ({
    theme,
    marginType,
    selected,
    selectedPosition,
    disabled,
    hovered,
    padded,
    divider,
    isSectionHeader,
    showsActiveState,
  }) => {
    const margin = getPositionMargin(marginType);

    return {
      ...theme.textStyles.small,
      ...(isSectionHeader && { fontWeight: 500 }),
      flex: '0 0 auto',
      userSelect: 'none',
      cursor: 'default',
      paddingTop: '6px',
      paddingRight: '12px',
      paddingBottom: '6px',
      paddingLeft: '12px',
      ...(padded && {
        borderRadius: '2px',
        marginLeft: '8px',
        marginRight: '8px',
        marginTop: `${margin.top}px`,
        marginBottom: `${margin.bottom}px`,
      }),
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
        boxShadow: `0 0 0 1px ${theme.colors.primary} inset`,
      }),
      ...(showsActiveState && {
        '&:active': {
          backgroundColor: selected
            ? theme.colors.primaryLight
            : theme.colors.activeBackground,
        },
      }),
      ...(divider && {
        borderBottom: `1px solid ${theme.colors.dividerSubtle}`,
      }),
    };
  },
);

const ListViewDragIndicatorElement = styled.div<{
  relativeDropPosition: RelativeDropPosition;
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

interface ListViewClickInfo {
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  ctrlKey: boolean;
}

interface ListViewRowProps<MenuItemType extends string = string> {
  id?: string;
  selected?: boolean;
  depth?: number;
  disabled?: boolean;
  draggable?: boolean;
  hovered?: boolean;
  sortable?: boolean;
  onPress?: (info: ListViewClickInfo) => void;
  onDoubleClick?: () => void;
  onHoverChange?: (isHovering: boolean) => void;
  children?: ReactNode;
  isSectionHeader?: boolean;
  menuItems?: MenuItem<MenuItemType>[];
  onSelectMenuItem?: (value: MenuItemType) => void;
  onContextMenu?: () => void;
  onMenuOpenChange?: (isOpen: boolean) => void;
}

const ListViewRow = forwardRef(function ListViewRow<
  MenuItemType extends string,
>(
  {
    id,
    selected = false,
    depth = 0,
    disabled = false,
    hovered = false,
    isSectionHeader = false,
    sortable: overrideSortable,
    onPress,
    onDoubleClick,
    onHoverChange,
    children,
    menuItems,
    onContextMenu,
    onSelectMenuItem,
    onMenuOpenChange,
  }: ListViewRowProps<MenuItemType>,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const {
    marginType,
    selectedPosition,
    sortable,
    indentation,
    pressEventName,
    padded,
    divider,
  } = useContext(ListRowContext);
  const { hoverProps } = useHover({
    onHoverChange,
  });

  const handlePress = useCallback(
    (event: React.MouseEvent) => {
      // We use preventDefault as a hack to mark this event as handled. We check for
      // this in the ListView.Root. We can't stopPropagation here or existing ContextMenus
      // won't close (onPointerDownOutside won't fire).
      event.preventDefault();

      if (!isLeftButtonClicked(event)) return;

      onPress?.(event);
    },
    [onPress],
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
      relativeDropPosition?: RelativeDropPosition;
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
        onDoubleClick={handleDoubleClick}
        marginType={marginType}
        disabled={disabled}
        hovered={hovered}
        selected={selected}
        padded={padded}
        selectedPosition={selectedPosition}
        showsActiveState={pressEventName === 'onClick'}
        aria-selected={selected}
        divider={divider}
        {...renderProps}
        {...mergeEventHandlers(
          { onPointerDown: renderProps.onPointerDown },
          { [pressEventName]: handlePress },
        )}
      >
        {relativeDropPosition && (
          <ListViewDragIndicatorElement
            relativeDropPosition={relativeDropPosition}
            offsetLeft={33 + depth * indentation}
          />
        )}
        {depth > 0 && <Spacer.Horizontal size={depth * indentation} />}
        {children}
      </RowContainer>
    );

    if (menuItems && onSelectMenuItem) {
      return (
        <ContextMenu<MenuItemType>
          items={menuItems}
          onSelect={onSelectMenuItem}
          onOpenChange={onMenuOpenChange}
        >
          {element}
        </ContextMenu>
      );
    }

    return element;
  };

  if (sortable && id) {
    return (
      <Sortable.Item<HTMLElement> id={id} disabled={overrideSortable === false}>
        {({ ref: sortableRef, ...sortableProps }) =>
          renderContent(sortableProps, composeRefs(sortableRef, forwardedRef))
        }
      </Sortable.Item>
    );
  }

  return renderContent({}, forwardedRef);
});

/* ----------------------------------------------------------------------------
 * VirtualizedListRow
 * ------------------------------------------------------------------------- */

const RenderItemContext = createContext<(index: number) => ReactNode>(
  () => null,
);

const VirtualizedListRow = memo(function VirtualizedListRow({
  index,
  style,
}: ListChildComponentProps) {
  const renderItem = useContext(RenderItemContext);

  return (
    <div key={index} style={style}>
      {renderItem(index)}
    </div>
  );
});

/* ----------------------------------------------------------------------------
 * VirtualizedList
 * ------------------------------------------------------------------------- */

interface VirtualizedListProps<T> {
  size: Size;
  scrollElement: HTMLDivElement;
  items: T[];
  getItemHeight: (index: number) => number;
  keyExtractor: (index: number) => string;
  renderItem: (index: number) => ReactNode;
}

interface IVirtualizedList {
  scrollToIndex(index: number): void;
}

const VirtualizedListInner = forwardRef(function VirtualizedListInner<T>(
  {
    size,
    scrollElement,
    items,
    getItemHeight,
    keyExtractor,
    renderItem,
  }: VirtualizedListProps<T>,
  ref: ForwardedRef<IVirtualizedList>,
) {
  const listRef = useRef<VariableSizeList<T> | null>(null);

  useImperativeHandle(ref, () => ({
    scrollToIndex(index) {
      listRef.current?.scrollToItem(index);
    },
  }));

  useLayoutEffect(() => {
    listRef.current?.resetAfterIndex(0);
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

  return (
    <RenderItemContext.Provider value={renderItem}>
      <WindowScroller
        scrollElement={scrollElement}
        style={useMemo(() => ({ flex: '1 1 auto' }), [])}
      >
        {useCallback(
          ({ registerChild, onChildScroll, scrollTop }) => (
            <div ref={registerChild}>
              <VariableSizeList<T>
                ref={listRef}
                // The list won't update on scroll unless we force it to by changing key
                key={scrollTop}
                style={listStyle}
                itemKey={keyExtractor}
                onScroll={({ scrollOffset }: { scrollOffset: number }) => {
                  onChildScroll({ scrollTop: scrollOffset });
                }}
                initialScrollOffset={scrollTop}
                width={size.width}
                height={size.height}
                itemCount={items.length}
                itemSize={getItemHeight}
                estimatedItemSize={31}
              >
                {VirtualizedListRow}
              </VariableSizeList>
            </div>
          ),
          [
            listStyle,
            keyExtractor,
            size.width,
            size.height,
            items.length,
            getItemHeight,
          ],
        )}
      </WindowScroller>
    </RenderItemContext.Provider>
  );
});

const VirtualizedList = memo(
  VirtualizedListInner,
) as typeof VirtualizedListInner;

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

type ListViewItemInfo = {
  isDragging: boolean;
};

type ChildrenProps = {
  children: ReactNode;
};

type RenderProps<T> = {
  data: T[];
  renderItem: (item: T, index: number, info: ListViewItemInfo) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  sortable?: boolean;
  virtualized?: Size;
};

type ListViewVariant = 'normal' | 'padded';

type ListViewRootProps = {
  onPress?: () => void;
  scrollable?: boolean;
  expandable?: boolean;
  onMoveItem?: (
    sourceIndex: number,
    destinationIndex: number,
    position: RelativeDropPosition,
  ) => void;
  indentation?: number;
  acceptsDrop?: DropValidator;
  pressEventName?: PressEventName;
  variant?: ListViewVariant;
  divider?: boolean;
};

const ListViewRootInner = forwardRef(function ListViewRootInner<T>(
  {
    onPress,
    scrollable = false,
    expandable = true,
    sortable = false,
    divider = false,
    onMoveItem,
    indentation = 12,
    acceptsDrop,
    data,
    renderItem,
    keyExtractor,
    virtualized,
    variant,
    pressEventName = 'onClick',
  }: RenderProps<T> & ListViewRootProps,
  forwardedRef: ForwardedRef<IVirtualizedList>,
) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.classList.contains('scroll-component')
      )
        return;

      // As a hack, we call preventDefault in a row if the event was handled.
      // If the event wasn't handled already, we call onPress here.
      if (!event.isDefaultPrevented()) {
        onPress?.();
      }
    },
    [onPress],
  );

  const renderChild = useCallback(
    (index: number) => renderItem(data[index], index, { isDragging: false }),
    [data, renderItem],
  );

  const renderOverlay = useCallback(
    (index: number) => renderItem(data[index], index, { isDragging: true }),
    [renderItem, data],
  );

  const getItemContextValue = useCallback(
    (i: number): ListRowContextValue | undefined => {
      const current = renderChild(i);

      if (!isValidElement(current)) return;

      const prevChild = i - 1 >= 0 && renderChild(i - 1);
      const nextChild = i + 1 < data.length && renderChild(i + 1);

      const next: ReactElement | undefined = isValidElement(nextChild)
        ? nextChild
        : undefined;
      const prev: ReactElement | undefined = isValidElement(prevChild)
        ? prevChild
        : undefined;

      const hasMarginTop = !prev;
      const hasMarginBottom =
        !next ||
        current.props.isSectionHeader ||
        (next && next.props.isSectionHeader);

      let marginType: ListRowMarginType;

      if (hasMarginTop && hasMarginBottom) {
        marginType = 'vertical';
      } else if (hasMarginBottom) {
        marginType = 'bottom';
      } else if (hasMarginTop) {
        marginType = 'top';
      } else {
        marginType = 'none';
      }

      let selectedPosition: ListRowPosition = 'only';

      if (current.props.selected) {
        const nextSelected =
          next && !next.props.isSectionHeader && next.props.selected;
        const prevSelected =
          prev && !prev.props.isSectionHeader && prev.props.selected;

        if (nextSelected && prevSelected) {
          selectedPosition = 'middle';
        } else if (nextSelected && !prevSelected) {
          selectedPosition = 'first';
        } else if (!nextSelected && prevSelected) {
          selectedPosition = 'last';
        }
      }

      return {
        marginType,
        selectedPosition,
        sortable,
        expandable,
        divider,
        indentation,
        pressEventName,
        padded: variant === 'padded',
      };
    },
    [
      renderChild,
      data.length,
      sortable,
      expandable,
      divider,
      indentation,
      pressEventName,
      variant,
    ],
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

  const ids = useMemo(() => data.map(keyExtractor), [keyExtractor, data]);

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
      const margin = child?.marginType
        ? getPositionMargin(child.marginType)
        : { top: 0, bottom: 0 };
      const height =
        31 + (variant === 'padded' ? margin.top + margin.bottom : 0);
      return height;
    },
    [getItemContextValue, variant],
  );

  const getKey = useCallback(
    (index: number) => keyExtractor(data[index], index),
    [data, keyExtractor],
  );

  return (
    <RootContainer
      {...{
        [pressEventName]: handleClick,
      }}
      scrollable={scrollable}
    >
      {withScrollable((scrollElementRef: HTMLDivElement | null) =>
        withSortable(
          virtualized ? (
            <VirtualizedList<T>
              ref={forwardedRef}
              scrollElement={scrollElementRef!}
              items={data}
              size={virtualized}
              getItemHeight={getItemHeight}
              keyExtractor={getKey}
              renderItem={renderWrappedChild}
            />
          ) : (
            range(0, data.length).map(renderWrappedChild)
          ),
        ),
      )}
    </RootContainer>
  );
});

const ListViewRoot = memo(ListViewRootInner) as typeof ListViewRootInner;

const ChildrenListViewInner = forwardRef(function ChildrenListViewInner(
  { children, ...rest }: ChildrenProps & ListViewRootProps,
  forwardedRef: ForwardedRef<IVirtualizedList>,
) {
  const items: ReactElement[] = useMemo(
    () =>
      Children.toArray(children).flatMap((child) =>
        isValidElement(child) ? [child] : [],
      ),
    [children],
  );

  return (
    <ListViewRoot
      ref={forwardedRef}
      {...rest}
      data={items}
      keyExtractor={useCallback(
        ({ key }: { key: string | number | null }, index: number) =>
          typeof key === 'string' ? key : (key ?? index).toString(),
        [],
      )}
      renderItem={useCallback((item: ReactElement) => item, [])}
    />
  );
});

const ChildrenListView = memo(ChildrenListViewInner);

const SimpleListViewInner = forwardRef(function SimpleListViewInner<T = any>(
  props: (ChildrenProps | RenderProps<T>) & ListViewRootProps,
  forwardedRef: ForwardedRef<IVirtualizedList>,
) {
  if ('children' in props) {
    return <ChildrenListView ref={forwardedRef} {...props} />;
  } else {
    return <ListViewRoot ref={forwardedRef} {...props} />;
  }
});

/**
 * A ListView can be created either with `children` or render props
 */
const SimpleListView = memo(SimpleListViewInner);

export namespace ListView {
  export const RowTitle = memo(ListViewRowTitle);
  export const EditableRowTitle = memo(ListViewEditableRowTitle);
  export const Row = memo(ListViewRow);
  export const Root = SimpleListView;
  export const RowContext = ListRowContext;
  export type ClickInfo = ListViewClickInfo;
  export type ItemInfo = ListViewItemInfo;
  export type RowProps<MenuItemType extends string = string> =
    ListViewRowProps<MenuItemType>;
  export type VirtualizedList = IVirtualizedList;
  export const DragIndicator = ListViewDragIndicatorElement;
  export const rowHeight = 31;
}
