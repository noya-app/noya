import React, {
  memo,
  useRef,
  useMemo,
  useState,
  useContext,
  useCallback,
  createContext,
  MutableRefObject,
} from 'react';
import { View, FlatList, LayoutChangeEvent } from 'react-native';
import Animated, {
  SharedValue,
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

import { Point } from 'noya-geometry';
import type {
  DropValidator,
  ItemMeasurement,
  SortableRootProps,
  SortableListProps,
  SortableItemProps,
} from './types';
import { Gesture, TouchableListener } from '../Touchable';
import { validateDropIndicator, defaultAcceptsDrop } from './utils';
import { RelativeDropPosition } from 'packages/noya-web-designsystem';

interface OverInfo {
  index?: number;
  id?: string;
}

interface SortableContextType {
  acceptsDrop: DropValidator;
  touchPos: SharedValue<Point>;
  activeItem?: OverInfo;
  overItem: SharedValue<OverInfo | undefined>;
  touchOffset: SharedValue<Point>;
  measurements: MutableRefObject<ItemMeasurement[]>;
  setActiveItemIndex: (index: number | undefined) => void;
}

// @ts-ignore Initial value doesn't really matter \m/
const SortableContext = createContext<SortableContextType>(undefined);

function SortableItem<T>({ id, disabled, children }: SortableItemProps<T>) {
  const { activeItem, measurements, acceptsDrop, overItem, touchPos } =
    useContext(SortableContext);
  const [dropPosition, setDropPosition] = useState<
    RelativeDropPosition | undefined
  >();

  const onValidateDrop = useCallback(
    (overItem: OverInfo, offset: Point) => {
      const relativeDropPosition = validateDropIndicator(
        acceptsDrop,
        activeItem!.id!,
        overItem.id!,
        offset.y,
        measurements.current[overItem.index!]?.pos.y,
        measurements.current[overItem.index!]?.size.height,
      );

      if (relativeDropPosition !== dropPosition) {
        setDropPosition(relativeDropPosition);
      }
    },
    [activeItem, measurements, acceptsDrop, dropPosition],
  );

  useDerivedValue(() => {
    if (overItem.value?.id === id && activeItem?.id !== id && !disabled) {
      runOnJS(onValidateDrop)(overItem.value, touchPos.value);
    } else if (dropPosition && overItem.value?.id !== id) {
      runOnJS(setDropPosition)(undefined);
    }
  }, [activeItem, dropPosition, id, disabled]);

  return children({
    relativeDropPosition: activeItem?.id ? dropPosition : undefined,
  });
}

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
        x: params.point.x - (sortable.measurements.current[index]?.pos.x ?? 0),
        y: params.point.y - (sortable.measurements.current[index]?.pos.y ?? 0),
      };
    },
    [sortable, index],
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

      sortable.measurements.current[index] = {
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
  const {
    data,
    style,
    renderItem,
    keyExtractor,
    renderOverlay,
    acceptsDrop = defaultAcceptsDrop,
  } = props;
  const [activeItemIndex, setActiveItemIndex] = useState<number>();
  const touchPos = useSharedValue<Point>({ x: 0, y: 0 });
  const touchOffset = useSharedValue<Point>({ x: 0, y: 0 });
  const measurements = useRef<ItemMeasurement[]>([]);

  const isDragging = activeItemIndex !== undefined;

  const indexToKey = useMemo(() => {
    const mapping: string[] = [];

    data.forEach((item, index) => {
      mapping[index] = keyExtractor(item, index);
    });

    return mapping;
  }, [data, keyExtractor]);

  const activeItem = useMemo(() => {
    if (activeItemIndex === undefined) {
      return;
    }

    return {
      index: activeItemIndex,
      id: indexToKey[activeItemIndex],
    };
  }, [activeItemIndex, indexToKey]);

  const overItem = useDerivedValue<OverInfo | undefined>(() => {
    let index;

    if (!isDragging) {
      return;
    }

    measurements.current.forEach((item, idx) => {
      if (item.pos.y < touchPos.value.y) {
        index = idx;
      }
    });

    const id = index ? indexToKey[index] : undefined;

    return { index, id };
  }, [isDragging, data, keyExtractor, measurements]);

  const dragItemStyle = useAnimatedStyle(() => {
    if (!isDragging) {
      return { position: 'absolute', top: 0, left: 0 };
    }

    return {
      zIndeX: 1000,
      position: 'absolute',
      width: measurements.current[activeItemIndex]?.size.width,
      left: touchPos.value.x - touchOffset.value.x,
      top: touchPos.value.y - touchOffset.value.y,
    };
  }, [isDragging, measurements]);

  return (
    <SortableContext.Provider
      value={{
        touchPos,
        overItem,
        activeItem,
        acceptsDrop,
        touchOffset,
        measurements,
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
          <Animated.View style={dragItemStyle} pointerEvents="none">
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
