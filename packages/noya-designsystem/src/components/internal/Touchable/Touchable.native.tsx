import React, {
  memo,
  useMemo,
  useContext,
  createContext,
  PropsWithChildren,
} from 'react';
import Animated, { runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { TouchableProps, TouchableContextType } from './types';

const initialHandlers = {
  pressHandlers: [],
  longPressHandlers: [],
  // panBeginHandlers: [],
  // panUpdateHandlers: [],
  // panEndHandlers: [],
};

const TouchableContext = createContext<TouchableContextType>(initialHandlers);

export const useTouchableContext = (): TouchableContextType | undefined => {
  const value = useContext(TouchableContext);

  return value;
};

const TouchableListenerInner: React.FC<PropsWithChildren<TouchableProps>> = (
  props,
) => {
  const { children, ...touchableProps } = props;
  const parentHandlers = useTouchableContext();

  const handlers = useMemo(() => {
    let composedHandlers: TouchableContextType = {
      pressHandlers: [
        ...(parentHandlers ? parentHandlers.pressHandlers : []),
        ...(touchableProps.onPress ? [touchableProps.onPress] : []),
      ],
      longPressHandlers: [
        ...(parentHandlers ? parentHandlers.longPressHandlers : []),
        ...(touchableProps.onLongPress ? [touchableProps.onLongPress] : []),
      ],
    };

    return composedHandlers;
  }, [parentHandlers, touchableProps]);

  return (
    <TouchableContext.Provider value={handlers}>
      {children}
    </TouchableContext.Provider>
  );
};

const Touchable: React.FC<TouchableProps> = (props) => {
  const { children } = props;
  const handlers = useTouchableContext();

  const onPress = (x: number, y: number) => {
    props.onPress?.(x, y);

    if (handlers && handlers.pressHandlers.length) {
      handlers.pressHandlers.forEach((h) => h(x, y));
    }
  };

  const onLongPress = (x: number, y: number) => {
    props.onLongPress?.(x, y);

    if (handlers && handlers.longPressHandlers.length) {
      handlers.longPressHandlers.forEach((h) => h(x, y));
    }
  };

  const longPressGesture = Gesture.LongPress().onEnd((event, success) => {
    if (success) {
      runOnJS(onLongPress)(event.absoluteX, event.absoluteY);
    }
  });

  const pressGesture = Gesture.Tap().onEnd((event, success) => {
    if (success) {
      runOnJS(onPress)(event.absoluteX, event.absoluteY);
    }
  });

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      // TODO
    })
    .onUpdate((e) => {
      // TODO
    })
    .onEnd((e) => {
      // TODO
    });

  const gesture = Gesture.Race(panGesture, longPressGesture, pressGesture);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View collapsable={false} style={{}}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

export const TouchableListener = memo(TouchableListenerInner);
export default memo(Touchable);
