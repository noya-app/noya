import { renderHook, act } from '@testing-library/react-hooks';
import { useMutableState } from '../hooks/useMutableState';

test('uses mutable object', () => {
  const object = { a: 1 };

  const { result } = renderHook(() => useMutableState(object));

  const proxy1 = result.current[0];
  expect(proxy1).not.toBe(object);
  expect(proxy1).toEqual(object);

  act(() => {
    result.current[1](() => {
      object.a = 2;
    });
  });

  const proxy2 = result.current[0];
  expect(proxy2).not.toBe(object);
  expect(proxy2).not.toBe(proxy1);
  expect(proxy2).toEqual(object);
  expect(proxy2).toEqual(proxy1);
});

test('uses mutable object with initializer', () => {
  const object = { a: 1 };

  const initializer = jest.fn(() => object);

  const { result, rerender } = renderHook(() => useMutableState(initializer));

  const proxy = result.current[0];
  expect(proxy).not.toBe(object);
  expect(proxy).toEqual(object);

  rerender();

  expect(initializer).toBeCalledTimes(1);
});
