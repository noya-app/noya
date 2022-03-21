import React, {
  memo,
  useState,
  useContext,
  useCallback,
  createContext,
} from 'react';
import { View, FlatList, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  SharedValue,
  useDerivedValue,
} from 'react-native-reanimated';

import { Point } from 'noya-geometry';
import type {
  SortableRootProps,
  SortableListProps,
  SortableItemProps,
  ItemMeasurement,
} from './types';
import { Gesture, TouchableListener } from '../Touchable';
import { validateDropIndicator, defaultAcceptsDrop } from './utils';

interface SortableContextType {
  // overId?: string;
  // acceptsDrop?: DropValidator;
  // setOverId: (id: string | undefined) => void;
  activeItemIndex?: number;
  touchPos: SharedValue<Point>;
  overIndex: SharedValue<number | undefined>;
  touchOffset: SharedValue<Point>;
  measurements: SharedValue<ItemMeasurement[]>;
  setActiveItemIndex: (index: number | undefined) => void;
}

// @ts-ignore Initial value doesn't really matter \m/
const SortableContext = createContext<SortableContextType>(undefined);

function SortableItem<T>({ id, disabled, children }: SortableItemProps<T>) {}

interface CellRendererComponentProps<T> {
  item: T;
  index: number;
  children: React.ReactNode;
}

const CellRendererComponent = memo(function CellRendererComponent<T>(
  props: CellRendererComponentProps<T>,
) {
  const sortable = useContext(SortableContext);
  const { index, children } = props;

  const onTouchStart = useCallback(
    (params: Gesture) => {
      sortable.setActiveItemIndex(index);

      sortable.touchPos.value = params.point;
      sortable.touchOffset.value = {
        x: params.point.x - (sortable.measurements.value[index]?.pos.x ?? 0),
        y: params.point.y - (sortable.measurements.value[index]?.pos.y ?? 0),
      };
    },
    [index, sortable],
  );

  const onTouchUpdate = useCallback(
    (params: Gesture) => {
      sortable.touchPos.value = params.point;
    },
    [sortable],
  );

  const onTouchEnd = useCallback(
    (params: Gesture) => {
      sortable.setActiveItemIndex(undefined);
    },
    [sortable],
  );

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const {
        layout: { width, height, x, y },
      } = event.nativeEvent;

      sortable.measurements.value[index] = {
        size: { width, height },
        pos: { x, y },
      };
    },
    [sortable, index],
  );

  return (
    <TouchableListener
      onTouchStart={onTouchStart}
      onTouchUpdate={onTouchUpdate}
      onTouchEnd={onTouchEnd}
    >
      {/*  index as key enforces onLayout event after data list has been modified */}
      <View onLayout={onLayout} key={index}>
        {children}
      </View>
    </TouchableListener>
  );
});

function SortableList<T>(props: SortableListProps<T>) {
  const { data, keyExtractor, renderItem, style, acceptsDrop, renderOverlay } =
    props;
  const [activeItemIndex, setActiveItemIndex] = useState<number>();
  const touchPos = useSharedValue<Point>({ x: 0, y: 0 });
  const touchOffset = useSharedValue<Point>({ x: 0, y: 0 });
  const measurements = useSharedValue<ItemMeasurement[]>([]);

  const isDragging = activeItemIndex !== undefined;

  const overIndex = useDerivedValue<number | undefined>(() => {
    let over;

    if (!isDragging) {
      return;
    }

    measurements.value.forEach((item, index) => {
      if (item.pos.y < touchPos.value.y) {
        over = index;
      }
    });

    return over;
  }, [activeItemIndex, measurements]);

  const dragItemStyle = useAnimatedStyle(() => {
    if (!isDragging) {
      return { position: 'absolute', top: 0, left: 0 };
    }

    return {
      zIndeX: 1000,
      flexDirection: 'row',
      position: 'absolute',
      width: measurements.value[activeItemIndex]?.size.width,
      height: measurements.value[activeItemIndex]?.size.height,
      left: touchPos.value.x - touchOffset.value.x,
      top: touchPos.value.y - touchOffset.value.y,
    };
  });

  return (
    <SortableContext.Provider
      value={{
        touchPos,
        overIndex,
        touchOffset,
        measurements,
        activeItemIndex,
        setActiveItemIndex,
      }}
    >
      <View style={[style, { flex: 1 }]}>
        <FlatList
          style={style}
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          CellRendererComponent={CellRendererComponent}
          scrollEnabled={!isDragging}
        />
        {isDragging && (
          <Animated.View style={dragItemStyle}>
            {renderOverlay?.(activeItemIndex)}
          </Animated.View>
        )}
      </View>
    </SortableContext.Provider>
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
