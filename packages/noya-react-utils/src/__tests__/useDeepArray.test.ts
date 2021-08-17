import { renderHook } from '@testing-library/react-hooks';
import { useDeepArray } from '../hooks/useDeepArray';

test('returns the same array', () => {
  const array1 = [{ name: 'a' }];
  const array2 = [{ name: 'a' }];

  const { result, rerender } = renderHook(({ value }) => useDeepArray(value), {
    initialProps: { value: array1 },
  });

  rerender({ value: array2 });

  expect(result.current).toBe(array1);
});

test('returns a different array', () => {
  const array1 = [{ name: 'a' }];
  const array2 = [{ name: 'b' }];

  const { result, rerender } = renderHook(({ value }) => useDeepArray(value), {
    initialProps: { value: array1 },
  });

  rerender({ value: array2 });

  expect(result.current).toBe(array2);
});
