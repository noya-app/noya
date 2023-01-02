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

export type ReactEventHandlers = ReturnType<ReturnType<typeof useGesture>>;
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
