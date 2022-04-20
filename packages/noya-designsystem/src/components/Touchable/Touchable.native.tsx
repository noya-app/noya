import React, {
  memo,
  useMemo,
  useContext,
  useCallback,
  createContext,
  PropsWithChildren,
} from 'react';
import { View, ViewProps } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Point } from 'noya-geometry';
import {
  TapEvent,
  PanEvent,
  PanUpdateEvent,
  LongPressEvent,
} from '../../utils';
import type {
  TouchEvent,
  TouchableProps,
  TouchHandlerName,
  TouchableContextType,
} from './types';

export const TouchableContext = createContext<TouchableContextType>([]);

function useTouchableHandlers({
  onTouchStart,
  onTouchUpdate,
  onTouchEnd,
  onPress,
  onLongPress,
}: TouchableProps) {
  const parentHandlers = useContext(TouchableContext);

  return useMemo(() => {
    return [
      ...parentHandlers,
      {
        onTouchStart,
        onTouchUpdate,
        onTouchEnd,
        onPress,
        onLongPress,
      },
    ];
  }, [
    parentHandlers,
    onTouchStart,
    onTouchUpdate,
    onTouchEnd,
    onPress,
    onLongPress,
  ]);
}

const TouchableListenerInner: React.FC<PropsWithChildren<TouchableProps>> = ({
  children,
  ...touchableProps
}) => {
  const handlers = useTouchableHandlers(touchableProps);

  return (
    <TouchableContext.Provider value={handlers}>
      {children}
    </TouchableContext.Provider>
  );
};

const TouchableInner: React.FC<TouchableProps & ViewProps> = ({
  children,
  onTouchStart,
  onTouchUpdate,
  onTouchEnd,
  onPress,
  onLongPress,
  ...viewProps
}) => {
  const lastPan = useSharedValue<Point>({ x: 0, y: 0 });

  const handlers = useTouchableHandlers({
    onTouchStart,
    onTouchUpdate,
    onTouchEnd,
    onPress,
    onLongPress,
  });

  const callHandlers = useCallback(
    (handlerName: TouchHandlerName, event: TouchEvent) => {
      handlers.forEach((handlers) => {
        handlers[handlerName]?.(event);
      });
    },
    [handlers],
  );

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd((event: TapEvent) => {
      callHandlers('onPress', {
        point: {
          x: event.x,
          y: event.y,
        },
        absolutePoint: {
          x: event.absoluteX,
          y: event.absoluteY,
        },
        delta: {
          x: 0,
          y: 0,
        },
      });
    });

  const longPressGesture = Gesture.LongPress()
    .runOnJS(true)
    .onEnd((event: LongPressEvent) => {
      callHandlers('onLongPress', {
        point: {
          x: event.x,
          y: event.y,
        },
        absolutePoint: {
          x: event.absoluteX,
          y: event.absoluteY,
        },
        delta: {
          x: 0,
          y: 0,
        },
      });
    });

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart((event: PanEvent) => {
      lastPan.value = {
        x: event.x,
        y: event.y,
      };

      callHandlers('onTouchStart', {
        point: {
          x: event.x,
          y: event.y,
        },
        absolutePoint: {
          x: event.absoluteX,
          y: event.absoluteY,
        },
        delta: {
          x: 0,
          y: 0,
        },
      });
    })
    .onChange((event: PanUpdateEvent) => {
      callHandlers('onTouchUpdate', {
        point: {
          x: event.x,
          y: event.y,
        },
        absolutePoint: {
          x: event.absoluteX,
          y: event.absoluteY,
        },
        delta: {
          x: event.x - lastPan.value.x,
          y: event.y - lastPan.value.y,
        },
      });

      lastPan.value = {
        x: event.x,
        y: event.y,
      };
    })
    .onEnd((event: PanEvent) => {
      callHandlers('onTouchEnd', {
        point: {
          x: event.x,
          y: event.y,
        },
        absolutePoint: {
          x: event.absoluteX,
          y: event.absoluteY,
        },
        delta: {
          x: event.x - lastPan.value.x,
          y: event.y - lastPan.value.y,
        },
      });

      lastPan.value = {
        x: 0,
        y: 0,
      };
    });

  const gestures = Gesture.Race(panGesture, longPressGesture, tapGesture);

  return (
    <GestureDetector gesture={gestures}>
      <View {...viewProps} collapsable={false}>
        {children}
      </View>
    </GestureDetector>
  );
};

export const TouchableListener = memo(TouchableListenerInner);
export const Touchable = memo(TouchableInner);
