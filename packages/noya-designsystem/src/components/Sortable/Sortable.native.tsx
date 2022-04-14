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
import styled from 'styled-components';
import { View, FlatList, LayoutChangeEvent } from 'react-native';
import Animated, {
  SharedValue,
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

import { Point } from 'noya-geometry';
import { useScrollable } from '../ScrollableView';
import { PanEvent, PanUpdateEvent, TouchableListener } from '../Touchable';
import type {
  DropValidator,
  ItemMeasurement,
  SortableRootProps,
  SortableListProps,
  SortableItemProps,
  RelativeDropPosition,
} from './types';
import { validateDropIndicator, defaultAcceptsDrop } from './utils';

interface OverInfo {
  index?: number;
  id?: string;
}

interface SortableContextType {
  activeItem?: OverInfo;
  acceptsDrop: DropValidator;
  touchPos: SharedValue<Point>;
  touchOffset: SharedValue<Point>;
  overItem: SharedValue<OverInfo | undefined>;
  measurements: MutableRefObject<ItemMeasurement[]>;
  setActiveItemIndex: (index: number | undefined) => void;
  onDropItem: (offsetTop: number) => void;
}

// @ts-ignore Initial value doesn't really matter \m/
const SortableContext = createContext<SortableContextType>(undefined);

function SortableItem<T>({ id, disabled, children }: SortableItemProps<T>) {
  const {
    activeItem,
    measurements,
    acceptsDrop,
    overItem,
    touchPos,
    touchOffset,
  } = useContext(SortableContext);
  const [dropPosition, setDropPosition] = useState<
    RelativeDropPosition | undefined
  >();

  const onValidateDrop = useCallback(
    (overItem: OverInfo, offsetY: number) => {
      if (!activeItem?.id || !overItem?.id) {
        return;
      }

      const relativeDropPosition = validateDropIndicator(
        acceptsDrop,
        activeItem.id,
        overItem.id,
        offsetY,
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
    // Y position at which dragged item is being rendered
    const offsetY = touchPos.value.y - touchOffset.value.y;

    // validate drop indicator on JS thread
    // only if it is necessary
    if (overItem.value?.id === id && activeItem?.id !== id && !disabled) {
      runOnJS(onValidateDrop)(overItem.value, offsetY);
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
  const scrollable = useScrollable();
  const sortable = useContext(SortableContext);
  const { index, children } = props;
  const touchStartTimeoutRef = useRef<number>();

  const dragHandlers = {
    onStart: useCallback(
      (event: PanEvent) => {
        const point = { x: event.x, y: event.y };

        sortable.setActiveItemIndex(index);
        touchStartTimeoutRef.current = undefined;

        // If there is scroll view parent
        // Disable its scroll capture durning drag&drop
        if (scrollable.isAvailable) {
          scrollable.setScrollEnabled(false);
        }

        sortable.touchPos.value = point;
        // calculate difference between element and touch positions
        // to keep it consistent while dragging
        sortable.touchOffset.value = {
          x: point.x - (sortable.measurements.current[index]?.pos.x ?? 0),
          y: point.y - (sortable.measurements.current[index]?.pos.y ?? 0),
        };
      },
      [sortable, index, scrollable],
    ),
    onUpdate: useCallback(
      (event: PanUpdateEvent) => {
        sortable.touchPos.value = { x: event.x, y: event.y };
      },
      [sortable],
    ),
    onEnd: useCallback(
      (event: PanEvent) => {
        sortable.onDropItem(event.y - sortable.touchOffset.value.y);

        // Enable parent scrollview drag
        if (scrollable.isAvailable) {
          scrollable.setScrollEnabled(true);
        }
      },
      [sortable, scrollable],
    ),
  };

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

  // {/*  index as key enforces onLayout event after data list has been modified */}
  return (
    <TouchableListener gestures={{ panHandlersSingle: dragHandlers }}>
      <View onLayout={onLayout} key={index}>
        {children}
      </View>
    </TouchableListener>
  );
});

function SortableList<T>(props: SortableListProps<T>) {
  const {
    data,
    keys,
    style,
    renderItem,
    onMoveItem,
    keyExtractor,
    renderOverlay,
    scrollable = true,
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
    const offsetY = touchPos.value.y - touchOffset.value.y;

    measurements.current.forEach((item, idx) => {
      if (item.pos.y < offsetY) {
        index = idx;
      }
    });

    const id = index !== undefined ? indexToKey[index] : undefined;

    return { index, id };
  }, [isDragging, data, keyExtractor, measurements]);

  const onDropItem = useCallback(
    (offsetTop: number) => {
      const { index: oldIndex, id: activeId } = activeItem ?? {};
      const { index: newIndex, id: overId } = overItem.value ?? {};
      setActiveItemIndex(undefined);

      if (
        !activeId ||
        !overId ||
        oldIndex === undefined ||
        newIndex === undefined
      ) {
        return;
      }

      const indicator = validateDropIndicator(
        acceptsDrop,
        activeId,
        overId,
        offsetTop,
        measurements.current[newIndex]?.pos.y,
        measurements.current[newIndex]?.size.height,
      );

      if (!indicator) {
        return;
      }

      onMoveItem?.(keys.indexOf(activeId), keys.indexOf(overId), indicator);
    },
    [acceptsDrop, overItem.value, activeItem, onMoveItem, keys],
  );

  const dragItemStyle = useAnimatedStyle(() => {
    const top = touchPos.value.y - touchOffset.value.y;
    if (!isDragging) {
      return {
        top: 0,
        left: 0,
        opacity: 0,
      };
    }

    return {
      width: measurements.current[activeItemIndex]?.size.width,
      left: touchPos.value.x - touchOffset.value.x,
      top,
      opacity: 1,
    };
  }, [isDragging, measurements]);

  return (
    <SortableContext.Provider
      value={{
        touchPos,
        overItem,
        activeItem,
        onDropItem,
        acceptsDrop,
        touchOffset,
        measurements,
        setActiveItemIndex,
      }}
    >
      <View style={style}>
        {scrollable ? (
          <FlatList
            style={style}
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            CellRendererComponent={CellRendererComponent}
            scrollEnabled={!isDragging}
          />
        ) : (
          data.map((item, index) => (
            <CellRendererComponent
              key={keyExtractor(item, index)}
              item={item}
              index={index}
            >
              {renderItem({
                item,
                index,
                separators: {
                  highlight: () => {},
                  unhighlight: () => {},
                  updateProps: () => {},
                },
              })}
            </CellRendererComponent>
          ))
        )}
      </View>
      {isDragging && !!activeItem?.id && !!renderOverlay && (
        <Overlay style={dragItemStyle} pointerEvents="none">
          {renderOverlay(keys.indexOf(activeItem.id))}
        </Overlay>
      )}
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

const Overlay = styled(Animated.View)({
  position: 'absolute',
  zIndex: 10,
});
