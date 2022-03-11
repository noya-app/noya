import React, {
  memo,
  forwardRef,
  ForwardedRef,
  useCallback,
  createContext,
} from 'react';
import { View, FlatList, ListRenderItem } from 'react-native';
import styled from 'styled-components';

import type { ListViewRootProps, RenderProps, IVirtualizedList } from './types';

const ListViewRootInner = forwardRef(function ListViewRoot<T>(
  {
    onPress,
    scrollable = false,
    expandable = true,
    // sortable = false,
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
  // const getItemContextValue = useCallback((index: number) => {});

  const renderWrappedChild: ListRenderItem<T> = useCallback(
    (info) => {
      const current = renderItem(info.item, info.index, { isDragging: false });

      return <>{current}</>;
    },
    [renderItem],
  );

  return (
    <RootContainer scrollable={scrollable}>
      <FlatList<T>
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderWrappedChild}
      />
    </RootContainer>
  );
});

const ListViewRoot = memo(ListViewRootInner) as typeof ListViewRootInner;

const RootContainer = styled(View)<{ scrollable?: boolean }>(
  ({ scrollable }) => ({
    flexGrow: scrollable ? 1 : 0,
    flexShrink: 0,
    flexBasis: scrollable ? 0 : 'auto',
    flexWrap: 'wrap',
  }),
);

export const ListRowContext = createContext({});
export const DragIndicatorElement = () => {};
export const RowTitle = () => {};
export const EditableRowTitle = () => {};
export const Row = () => {};
export const Root = () => {};
