import { renderHook } from '@testing-library/react-hooks';
import { useShallowArray } from '../hooks/useShallowArray';

test('returns the same array', () => {
  const array1 = [1, 2, 3];
  const array2 = [1, 2, 3];

  const { result, rerender } = renderHook(
    ({ value }) => useShallowArray(value),
    { initialProps: { value: array1 } },
  );

  rerender({ value: array2 });

  expect(result.current).toBe(array1);
});

test('returns a different array', () => {
  const array1 = [1, 2, 3];
  const array2 = [1, 2];

  const { result, rerender } = renderHook(
    ({ value }) => useShallowArray(value),
    { initialProps: { value: array1 } },
  );

  rerender({ value: array2 });

  expect(result.current).toBe(array2);
});
