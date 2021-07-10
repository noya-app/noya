import { useGesture } from 'react-use-gesture';
import { composeEventHandlers } from '@radix-ui/primitive';

function unique<T>(array: T[]) {
  return [...new Set(array)];
}

function composeAllEventHandlers<E>(...handlers: ((e: E) => void)[]) {
  const [first, ...rest] = handlers;

  return rest.reduce(
    (result, handler) => composeEventHandlers(result, handler),
    first,
  );
}

type ReactEventHandlers = ReturnType<ReturnType<typeof useGesture>>;
type EventName = keyof ReactEventHandlers;

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
