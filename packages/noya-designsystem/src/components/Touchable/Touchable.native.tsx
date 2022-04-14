import React, {
  memo,
  useMemo,
  // useContext,
  // useCallback,
  createContext,
  PropsWithChildren,
} from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import type {
  // Gestures,
  // PanEvent,
  // PinchEvent,
  // PanHandlers,
  // PinchHandlers,
  // PanUpdateEvent,
  TouchableProps,
  // PinchUpdateEvent,
  TouchableContextType,
  TouchableComponentProps,
  // PressHandler,
  // LongPressHandler,
  // DoublePressHandler,
} from './types';

const TouchableContext = createContext<TouchableContextType>([]);

const TouchableListenerInner: React.FC<PropsWithChildren<TouchableProps>> = ({
  children,
  // gestures,
}) => {
  // const parentHandlers = useContext(TouchableContext);

  // const mergedContexts: TouchableContextType = useMemo(() => {
  //   return [...parentHandlers, gestures];
  // }, [gestures, parentHandlers]);
  // <TouchableContext.Provider value={mergedContexts}>
  // </TouchableContext.Provider>

  return <>{children}</>;
};

const Touchable: React.FC<TouchableComponentProps> = ({
  children,
  runOnUI = false,
  ...viewProps
}) => {
  // const parentHandlers = useContext(TouchableContext);

  // const handlers = useMemo(
  //   () => [...parentHandlers, gestures],
  //   [parentHandlers, gestures],
  // );

  // const getHandlers = useCallback(
  //   (handlerName: keyof Gestures) => {
  //     let gestureHandlers = [];

  //     for (let i = 0; i < handlers.length; i += 1) {
  //       if (!!handlers[i]?.[handlerName]) {
  //         gestureHandlers.push(handlers[i][handlerName]);
  //       }
  //     }

  //     return gestureHandlers;
  //   },
  //   [handlers],
  // );

  const gesture = useMemo(() => {
    return Gesture.Manual().runOnJS(true);
  }, []);

  return (
    <GestureDetector gesture={gesture}>
      <View {...viewProps} collapsable={false}>
        {children}
      </View>
    </GestureDetector>
  );
};

export const TouchableListener = memo(TouchableListenerInner);
export default memo(Touchable);

// const gestureMap: { [key: string]: any } = {};
// const panHandlersSingle = getHandlers('panHandlersSingle') as PanHandlers[];
// const panHandlersDouble = getHandlers('panHandlersDouble') as PanHandlers[];
// const pinchHandlers = getHandlers('pinchHandlers') as PinchHandlers[];
// const pressHandlers = getHandlers('onPress') as PressHandler[];
// const longPressHandlers = getHandlers('onLongPress') as LongPressHandler[];
// const doublePressHandlers = getHandlers(
//   'onDoublePress',
// ) as DoublePressHandler[];
// if (pressHandlers.length) {
//   gestureMap.pressHandler = Gesture.Tap()
//     .runOnJS(true)
//     .numberOfTaps(1)
//     .onEnd((event, success) => {
//       if (success) {
//         pressHandlers.forEach((handler) => handler(event));
//       }
//     });
// }
// if (doublePressHandlers.length) {
//   gestureMap.doublePressHandler = Gesture.Tap()
//     .runOnJS(true)
//     .numberOfTaps(2)
//     .onEnd((event, success) => {
//       if (success) {
//         doublePressHandlers.forEach((handler) => handler(event));
//       }
//     });
// }
// if (longPressHandlers.length) {
//   gestureMap.longPressHandler = Gesture.LongPress()
//     .runOnJS(true)
//     .onEnd((event, success) => {
//       if (success) {
//         longPressHandlers.forEach((handler) => handler(event));
//       }
//     });
// }
// if (panHandlersSingle.length) {
//   gestureMap.panHandlerSingle = Gesture.Pan()
//     .runOnJS(true)
//     .maxPointers(!!panHandlersDouble.length ? 1 : 5)
//     .onStart((event: PanEvent) => {
//       panHandlersSingle.forEach((handlers) => handlers.onStart(event));
//     })
//     .onUpdate((event: PanUpdateEvent) => {
//       panHandlersSingle.forEach((handlers) => handlers.onUpdate(event));
//     })
//     .onEnd((event: PanEvent) => {
//       panHandlersSingle.forEach((handlers) => handlers.onEnd(event));
//     });
// }
// if (pinchHandlers.length) {
//   gestureMap.pinchHandler = Gesture.Pinch()
//     .runOnJS(true)
//     .onStart((event: PinchEvent) => {
//       pinchHandlers.forEach((handlers) => handlers.onStart(event));
//     })
//     .onUpdate((event: PinchUpdateEvent) => {
//       pinchHandlers.forEach((handlers) => handlers.onUpdate(event));
//     })
//     .onEnd((event: PinchEvent) => {
//       pinchHandlers.forEach((handlers) => handlers.onEnd(event));
//     });
// }
// if (panHandlersDouble.length) {
//   gestureMap.panHandlerDouble = Gesture.Pan()
//     .runOnJS(true)
//     .minPointers(2)
//     .onStart((event: PanEvent) => {
//       panHandlersDouble.forEach((handlers) => handlers.onStart(event));
//     })
//     .onUpdate((event: PanUpdateEvent) => {
//       panHandlersDouble.forEach((handlers) => handlers.onUpdate(event));
//     })
//     .onEnd((event: PanEvent) => {
//       panHandlersDouble.forEach((handlers) => handlers.onEnd(event));
//     });
// }
// const handlersArray = Object.values(gestureMap);
// if (!handlersArray.length) {
//   return undefined;
// }
// if (handlersArray.length === 1) {
//   return handlersArray[0];
// }
// return Gesture.Race(...handlersArray);
