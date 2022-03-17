import React, {
  memo,
  useMemo,
  useState,
  useCallback,
  PropsWithChildren,
  useRef,
} from 'react';
import { View, FlatList, ListRenderItem } from 'react-native';
import Animated, {
  useAnimatedRef,
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { Point } from 'noya-geometry';
import {
  DropValidator,
  SortableRootProps,
  RelativeDropPosition,
  SortableListProps,
  SortableItemProps,
} from './types';
import { Gesture, TouchableListener } from '../Touchable';

/* ----------------------------------------------------------------------------
 * Item
 * ------------------------------------------------------------------------- */

type SortableListItemProps = PropsWithChildren<{
  isDragging: boolean;
  setIsDragging: (is: boolean) => void;
}>;

const SortableListItem = memo(function SortableListItem(
  props: SortableListItemProps,
) {
  const { children, isDragging, setIsDragging } = props;
  const wrapperRef = useAnimatedRef<View>();
  const elementSize = useSharedValue<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const offset = useSharedValue<Point>({ x: 0, y: 0 });
  const position = useSharedValue<Point>({ x: 0, y: 0 });
  const touchStartTimeout = useRef<number | null>(null);

  const onTouchStart = useCallback(
    (params: Gesture) => {
      touchStartTimeout.current = setTimeout(() => {
        setIsDragging(true);
        touchStartTimeout.current = null;
      }, 150);

      wrapperRef.current?.measure((x, y, width, height) => {
        elementSize.value = { width, height };
        offset.value = {
          x: params.point.x - x,
          y: params.point.y - y,
        };
        position.value = {
          x,
          y,
        };
      });
    },
    [wrapperRef, offset, elementSize, position, setIsDragging],
  );

  const onTouchUpdate = useCallback(
    (params: Gesture) => {
      if (touchStartTimeout.current) {
        clearTimeout(touchStartTimeout.current);
        touchStartTimeout.current = null;
      }
      if (!isDragging) {
        return;
      }

      position.value = {
        x: params.point.x - offset.value.x,
        y: params.point.y - offset.value.y,
      };
    },
    [position, isDragging, offset],
  );

  const onTouchEnd = useCallback(
    (params: Gesture) => {
      setIsDragging(false);
      touchStartTimeout.current = null;
      elementSize.value = { width: 0, height: 0 };
      offset.value = { x: 0, y: 0 };
    },
    [elementSize, setIsDragging, offset],
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: elementSize.value.width,
      height: elementSize.value.height,
      left: position.value.x,
      top: position.value.y,
      zIndeX: 1000,
    };
  });

  return (
    <TouchableListener
      onTouchStart={onTouchStart}
      onTouchUpdate={onTouchUpdate}
      onTouchEnd={onTouchEnd}
    >
      <View ref={wrapperRef}>{children}</View>
      {isDragging && (
        <Animated.View style={animatedStyle}>{children}</Animated.View>
      )}
    </TouchableListener>
  );
});

/* ----------------------------------------------------------------------------
 * List
 * ------------------------------------------------------------------------- */

function SortableList<T>(props: SortableListProps<T>) {
  const { data, keyExtractor, renderItem, style } = props;
  const [isDragging, setIsDragging] = useState(false);

  const renderWrappedChild: ListRenderItem<T> = useCallback(
    (info) => {
      return (
        <SortableListItem isDragging={isDragging} setIsDragging={setIsDragging}>
          {renderItem(info)}
        </SortableListItem>
      );
    },
    [renderItem, isDragging],
  );

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderWrappedChild}
      style={style}
      scrollEnabled={!isDragging}
    />
  );
}

/* ----------------------------------------------------------------------------
 * Root and Item
 * ------------------------------------------------------------------------- */

function SortableItem<T>(_props: SortableItemProps<T>) {
  throw new Error(
    'SortableItem is not implemented for mobile please use Sortable.List instead!',
  );
}

const SortableRoot = (_props: SortableRootProps) => {
  throw new Error(
    'Sortable.Root is not implemented for mobile please Sortable.List instead!',
  );
};

export const Item = memo(SortableItem);
export const Root = memo(SortableRoot);
export const List = memo(SortableList);
