import { useEffect, useReducer, useRef, useState } from 'react';

interface IObservable<T> {
  get: () => T;
  onChange: (callback: (value: T) => void) => () => void;
}

export function useObservable<T>(observable: IObservable<T>): T {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [value, setValue] = useState<T>(() => observable.get());

  useEffect(() => {
    return observable.onChange((value) => {
      setValue(value);
      forceUpdate();
    });
  }, [observable]);

  return value;
}

export function useObservableSelector<T, U>(
  observable: IObservable<T>,
  selector: (value: T | IObservable<T>) => U,
): U {
  const [value, setValue] = useState<U>(() => selector(observable));

  const selectorRef = useRef(selector);

  useEffect(() => {
    return observable.onChange((value) => setValue(selectorRef.current(value)));
  }, [observable]);

  return value;
}
