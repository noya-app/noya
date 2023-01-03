import { composeEventHandlers } from '@radix-ui/primitive';
import { unique } from 'noya-utils';
import { useGesture } from 'react-use-gesture';

function composeAllEventHandlers<E>(...handlers: ((e: E) => void)[]) {
  const [first, ...rest] = handlers;

  return rest.reduce(
    (result, handler) => composeEventHandlers(result, handler),
    first,
  );
}

export type ReactEventHandlers = ReturnType<ReturnType<typeof useGesture>> & {
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onKeyDownCapture?: (e: React.KeyboardEvent) => void;
  onKeyUp?: (e: React.KeyboardEvent) => void;
  onKeyUpCapture?: (e: React.KeyboardEvent) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  onKeyPressCapture?: (e: React.KeyboardEvent) => void;
};
export type EventName = keyof ReactEventHandlers;

export function mergeEventHandlers(
  ...handlerMaps: ReactEventHandlers[]
): ReactEventHandlers {
  const eventNames = unique(handlerMaps.map(Object.keys).flat() as EventName[]);

  return Object.fromEntries(
    eventNames.map((eventName) => {
      const handlers = handlerMaps.flatMap((handlerMap) => {
        const value = handlerMap[eventName];
        return value ? [value] : [];
      });

      return [eventName, composeAllEventHandlers(...handlers)];
    }),
  );
}
