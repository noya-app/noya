// MIT - https://github.com/LegendApp/legend-state/blob/e6c5a1c99437bd4462d0d51fbb5089df651e5b39/src/react/useSelector.ts
// This shouldn't be in our code! We should be able to import it.
// Copied in until we update react-scripts (via modular) and fix the import issue.

import {
  isObservable,
  observe,
  ObserveEvent,
  Selector,
} from '@legendapp/state';
import { useReducer, useRef } from 'react';

const Update = (s: number) => s + 1;

export function isFunction(obj: unknown): obj is Function {
  return typeof obj === 'function';
}

export function computeSelector<T>(selector: Selector<T>, e?: ObserveEvent<T>) {
  let c = selector as any;
  if (isFunction(c)) {
    c = e ? c(e) : c();
  }

  return isObservable(c) ? c.get() : c;
}

export function useSelector<T>(selector: Selector<T>): T {
  let inRun = true;
  let ret: T = undefined as unknown as T;
  const forceRender = useReducer(Update, 0)[1];
  const refDispose = useRef<() => void>();

  refDispose.current?.();

  if (!selector) return selector as T;

  refDispose.current = observe(function update(e) {
    // If running, call selector and re-render if changed
    let cur = inRun && computeSelector(selector);
    // Re-render if not currently rendering and value has changed
    if (!inRun) {
      forceRender();
      // Set cancel so that observe does not track
      e.cancel = true;
    }
    ret = cur;
    inRun = false;
  });

  return ret;
}
