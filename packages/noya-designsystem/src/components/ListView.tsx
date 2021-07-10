import { composeRefs } from '@radix-ui/react-compose-refs';
import ScrollArea from './ScrollArea';
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
  useMemo,
} from 'react';
import styled, { CSSObject } from 'styled-components';
import { useHover } from '../hooks/useHover';
import ContextMenu from './ContextMenu';
import * as Sortable from './Sortable';
import { MenuItem } from './internal/Menu';

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
};

export const ListRowContext = createContext<ListRowContextValue>({
  position: 'only',
  selectedPosition: 'only',
  sortable: false,
  expandable: true,
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
 * Row
 * ------------------------------------------------------------------------- */

const SectionHeaderContainer = styled.li<{
  selected: boolean;
  disabled: boolean;
}>(({ theme, selected, disabled }) => ({
  ...listReset,
  ...theme.textStyles.small,
  flex: '0 0 auto',
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
  color: theme.colors.textMuted,
  backgroundColor: theme.colors.listView.raisedBackground,
  ...(disabled && {
    color: theme.colors.textDisabled,
  }),
  ...(selected && {
    color: 'white',
    backgroundColor: theme.colors.primary,
  }),
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
}));

const RowContainer = styled.li<{
  position: ListRowPosition;
  selected: boolean;
  selectedPosition: ListRowPosition;
  disabled: boolean;
}>(({ theme, position, selected, selectedPosition, disabled }) => ({
  ...listReset,
  ...theme.textStyles.small,
  flex: '0 0 auto',
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
  color: theme.colors.textMuted,
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
    (selectedPosition === 'middle' || selectedPosition === 'last') && {
      borderTopRightRadius: '0px',
      borderTopLeftRadius: '0px',
    }),
  ...(selected &&
    (selectedPosition === 'middle' || selectedPosition === 'first') && {
      borderBottomRightRadius: '0px',
      borderBottomLeftRadius: '0px',
    }),
  position: 'relative',
}));

const DragIndicatorElement = styled.div<{
  dragIndicator: Sortable.DragIndicator;
}>(({ theme, dragIndicator }) => ({
  position: 'absolute',
  top: dragIndicator === 'above' ? 0 : undefined,
  bottom: dragIndicator === 'below' ? 0 : undefined,
  left: 0,
  right: 0,
  height: 3,
  background: theme.colors.primary,
  border: '1px solid rgba(255,255,255,0.5)',
  borderRadius: '3px',
}));

export interface ListViewClickInfo {
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface ListViewRowProps<MenuItemType extends string = string> {
  id?: string;
  selected?: boolean;
  disabled?: boolean;
  sortable?: boolean;
  onClick?: (info: ListViewClickInfo) => void;
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
    disabled = false,
    isSectionHeader = false,
    onClick,
    onHoverChange,
    children,
    menuItems,
    onContextMenu,
    onSelectMenuItem,
  }: ListViewRowProps<MenuItemType>,
  forwardedRef: ForwardedRef<HTMLLIElement>,
) {
  const { position, selectedPosition, sortable } = useContext(ListRowContext);
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

  const renderContent = (
    {
      dragIndicator,
      ...renderProps
    }: React.ComponentProps<typeof RowContainer> & {
      dragIndicator?: Sortable.DragIndicator;
    },
    ref: Ref<HTMLLIElement>,
  ) => {
    const Component = isSectionHeader ? SectionHeaderContainer : RowContainer;

    const element = (
      <Component
        ref={ref}
        onContextMenu={onContextMenu}
        id={id}
        {...hoverProps}
        onClick={handleClick}
        position={position}
        disabled={disabled}
        selected={selected}
        selectedPosition={selectedPosition}
        aria-selected={selected}
        {...renderProps}
      >
        {dragIndicator && (
          <DragIndicatorElement dragIndicator={dragIndicator} />
        )}
        {children}
      </Component>
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
      <Sortable.Item id={id}>
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

type ItemInfo = {
  index: number;
  isDragging: boolean;
};

type ChildrenProps<T> =
  | {
      children: ReactNode;
    }
  | {
      items: T[];
      renderItem: (item: T, info: ItemInfo) => ReactNode;
    };

type ListViewRootProps<T> = ChildrenProps<T> & {
  onClick?: () => void;
  sortable?: boolean;
  scrollable?: boolean;
  expandable?: boolean;
  onMoveItem?: (sourceIndex: number, destinationIndex: number) => void;
};

function ListViewRoot<T = any>({
  onClick,
  sortable = false,
  scrollable = false,
  expandable = true,
  onMoveItem,
  ...props
}: ListViewRootProps<T>) {
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      onClick?.();
    },
    [onClick],
  );

  const flattened =
    'items' in props
      ? props.items.map((item, index) =>
          props.renderItem(item, { index, isDragging: false }),
        )
      : Children.toArray(props.children);

  const ids: string[] = flattened.flatMap((current) =>
    isValidElement(current) && typeof current.props.id === 'string'
      ? [current.props.id]
      : [],
  );

  const getWrappedChild = (current: ReactNode, i: number) => {
    if (!isValidElement(current)) return current;

    const prev = flattened[i - 1];
    const next = flattened[i + 1];

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
    };

    return (
      <ListRowContext.Provider key={current.key} value={contextValue}>
        {current}
      </ListRowContext.Provider>
    );
  };

  const wrappedChildren = flattened.map(getWrappedChild);

  if (sortable && ids.length !== wrappedChildren.length) {
    throw new Error(
      'Bad ListView props: each row element needs an id to be sortable',
    );
  }

  const renderItem = 'items' in props ? props.renderItem : undefined;
  const items = 'items' in props ? props.items : undefined;

  const renderOverlay = useMemo(
    () =>
      renderItem && items
        ? (index: number) =>
            renderItem(items[index], {
              index,
              isDragging: true,
            })
        : undefined,
    [renderItem, items],
  );

  const content = sortable ? (
    <Sortable.Root
      onMoveItem={onMoveItem}
      keys={ids}
      renderOverlay={renderOverlay}
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
export const Row = memo(ListViewRow);
export const Root = memo(ListViewRoot);
