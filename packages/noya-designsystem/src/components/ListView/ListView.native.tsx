import React, {
  Ref,
  memo,
  useRef,
  useMemo,
  Children,
  useContext,
  forwardRef,
  useCallback,
  ReactElement,
  ForwardedRef,
  createContext,
  isValidElement,
  useLayoutEffect,
  ReactNode,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TextProps,
  ListRenderItem,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import styled from 'styled-components';

import { InputField } from '../InputField';
import { Layout } from '../Layout';
import {
  RenderProps,
  ChildrenProps,
  EditableRowProps,
  IVirtualizedList,
  ListViewRootProps,
  ListRowContextValue,
  ListRowContainerProps,
  ListRowMarginType,
  ListViewRowProps,
  ListRowPosition,
} from './types';
import { getPositionMargin } from './utils';

const StyledTitle = styled(Text)<{ disabled: boolean; selected: boolean }>(
  ({ theme, selected, disabled }) => ({
    overflow: 'hidden',
    color: selected
      ? 'white'
      : disabled
      ? theme.colors.textDisabled
      : theme.colors.textMuted,
  }),
);

function ListViewRowTitle(
  props: TextProps & { disabled: boolean; selected: boolean },
) {
  return <StyledTitle {...props} numberOfLines={1} />;
}

export const ListRowContext = createContext<ListRowContextValue>({
  marginType: 'none',
  selectedPosition: 'only',
  sortable: false,
  expandable: true,
  indentation: 12,
  pressEventName: 'onClick',
});

/* ----------------------------------------------------------------------------
 * EditableRowTitle
 * ------------------------------------------------------------------------- */

function ListViewEditableRowTitle({
  value,
  onSubmitEditing,
  autoFocus,
}: EditableRowProps) {
  const inputRef = useRef(null);

  useLayoutEffect(() => {
    const element = inputRef.current as unknown as TextInput;

    if (!element || !autoFocus) {
      return;
    }

    element.focus();
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

/* ----------------------------------------------------------------------------
 * Row
 * ------------------------------------------------------------------------- */

const RowContainer = styled(View)<ListRowContainerProps>(
  ({
    theme,
    marginType,
    selected,
    selectedPosition,
    disabled,
    hovered,
    isSectionHeader,
    showsActiveState,
  }) => {
    const margin = getPositionMargin(marginType);

    return {
      alignItems: 'center',
      position: 'relative',
      flexDirection: 'row',
      borderRadius: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginHorizontal: 8,
      marginTop: margin.top,
      marginBottom: margin.bottom,
      ...(isSectionHeader && {
        backgroundColor: theme.colors.listView.raisedBackground,
      }),
      ...(selected && {
        backgroundColor: theme.colors.primary,
      }),
      ...(selected &&
        !isSectionHeader &&
        (selectedPosition === 'middle' || selectedPosition === 'last') && {
          borderTopRightRadius: 0,
          borderTopLeftRadius: 0,
        }),
      ...(selected &&
        !isSectionHeader &&
        (selectedPosition === 'middle' || selectedPosition === 'first') && {
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
        }),
      ...(hovered && {
        boxShadow: `0 0 0 1px ${theme.colors.primary}`,
      }),
      // ...(showsActiveState && {
      //   '&:active': {
      //     backgroundColor: selected
      //       ? theme.colors.primaryLight
      //       : theme.colors.activeBackground,
      //   },
      // }),
    };
  },
);

export const DragIndicatorElement = memo(
  styled(View)(({ theme }) => ({
    zIndex: 1,
    position: 'absolute',
    borderRadius: 3,
  })),
);

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
    // sortable: overrideSortable,
    onPress,
    // onDoubleClick,
    // onHoverChange,
    children,
    onContextMenu,
  }: // menuItems,
  // onSelectMenuItem,
  ListViewRowProps<MenuItemType>,
  forwardedRef: ForwardedRef<View>,
) {
  const {
    marginType,
    selectedPosition,
    // sortable,
    indentation,
    pressEventName,
  } = useContext(ListRowContext);

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      onPress?.({
        // TODO
        shiftKey: false,
        altKey: false,
        metaKey: false,
        ctrlKey: false,
      });
    },
    [onPress],
  );

  const handleLongPress = useCallback(
    (event: GestureResponderEvent) => {
      onContextMenu?.();
    },
    [onContextMenu],
  );

  const renderContent = (
    {
      relativeDropPosition, // ...renderProps
    }: ListRowContainerProps & {
      relativeDropPosition?: any;
    },
    ref: Ref<View>,
  ) => {
    const element = (
      <TouchableOpacity onPress={handlePress} onLongPress={handleLongPress}>
        <RowContainer
          ref={ref}
          // onContextMenu={onContextMenu}
          isSectionHeader={isSectionHeader}
          id={id}
          // {...hoverProps}
          // onDoubleClick={handleDoubleClick}
          marginType={marginType}
          disabled={disabled}
          hovered={hovered}
          selected={selected}
          selectedPosition={selectedPosition}
          showsActiveState={pressEventName === 'onClick'}
          // {...renderProps}
          // {...mergeEventHandlers(
          //   { onPointerDown: renderProps.onPointerDown },
          //   { [pressEventName]: handlePress },
          // )}
        >
          {relativeDropPosition && (
            <DragIndicatorElement
              relativeDropPosition={relativeDropPosition}
              offsetLeft={33 + depth * indentation}
            />
          )}
          {depth > 0 && <Layout.Queue size={depth * indentation} />}
          {children}
        </RowContainer>
      </TouchableOpacity>
    );

    return element;
  };

  // if (sortable && id) {
  //   return (
  //     <Sortable.Item<HTMLElement> id={id} disabled={overrideSortable === false}>
  //       {({ ref: sortableRef, ...sortableProps }) =>
  //         renderContent(sortableProps, composeRefs(sortableRef, forwardedRef))
  //       }
  //     </Sortable.Item>
  //   );
  // }

  return renderContent(
    {
      disabled,
      marginType,
      selected,
      isSectionHeader,
      hovered,
      showsActiveState: true, // TODO
      selectedPosition,
    },
    forwardedRef,
  );
});

/* ----------------------------------------------------------------------------
 * Root
 * ------------------------------------------------------------------------- */

const RootContainer = styled(View)<{ scrollable?: boolean }>(
  ({ scrollable }) => ({
    flexGrow: scrollable ? 1 : 0,
    flexShrink: 0,
    flexBasis: scrollable ? 0 : 'auto',
    flexWrap: 'wrap',
  }),
);

const FlatListStyles = StyleSheet.create({ list: { width: '100%' } });

const ListViewRootInner = forwardRef(function ListViewRoot<T>(
  {
    onPress,
    scrollable = false,
    expandable = true,
    sortable = false,
    // onMoveItem,
    indentation = 12,
    // acceptsDrop,
    data,
    renderItem,
    keyExtractor,
    // virtualized,
    pressEventName = 'onClick',
  }: RenderProps<T> & ListViewRootProps,
  forwardedRef: ForwardedRef<IVirtualizedList>,
) {
  const getItemContextValue = useCallback(
    (current: ReactNode, i: number): ListRowContextValue | undefined => {
      if (!isValidElement(current)) return;

      const prevChild =
        i - 1 >= 0 && renderItem(data[i - 1], i - 1, { isDragging: false });
      const nextChild =
        i + 1 < data.length &&
        renderItem(data[i + 1], i + 1, { isDragging: false });

      const next = isValidElement(nextChild) ? nextChild : undefined;
      const prev = isValidElement(prevChild) ? prevChild : undefined;

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
        indentation,
        pressEventName,
      };
    },
    [data, renderItem, sortable, expandable, indentation, pressEventName],
  );

  const renderWrappedChild: ListRenderItem<T> = useCallback(
    (info) => {
      const current = renderItem(info.item, info.index, { isDragging: false });
      const contextValue = getItemContextValue(current, info.index);

      if (!contextValue || !isValidElement(current)) return null;

      return (
        <ListRowContext.Provider value={contextValue}>
          {current}
        </ListRowContext.Provider>
      );
    },
    [renderItem, getItemContextValue],
  );

  return (
    <RootContainer scrollable={scrollable}>
      <FlatList<T>
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderWrappedChild}
        style={FlatListStyles.list}
      />
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

const SimpleListViewInner = forwardRef(function SimpleListView<T = any>(
  props: (ChildrenProps | RenderProps<T>) & ListViewRootProps,
  forwardedRef: ForwardedRef<IVirtualizedList>,
) {
  if ('children' in props) {
    return <ChildrenListView ref={forwardedRef} {...props} />;
  }

  return <ListViewRoot ref={forwardedRef} {...props} />;
});

export const RowTitle = memo(ListViewRowTitle);
export const EditableRowTitle = memo(ListViewEditableRowTitle);
export const Row = memo(ListViewRow);
export const Root = memo(SimpleListViewInner);
