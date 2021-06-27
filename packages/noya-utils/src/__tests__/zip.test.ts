import { zip, zipLongest } from '../index';

describe('zip', () => {
  test('2-tuple of same length', () => {
    const a = [1, 2, 3];
    const b = ['a', 'b', 'c'];

    expect(zip(a, b)).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ]);
  });

  test('3-tuple of same length', () => {
    const a = [1, 2, 3];
    const b = ['a', 'b', 'c'];
    const c = [true, false, true];

    expect(zip(a, b, c)).toEqual([
      [1, 'a', true],
      [2, 'b', false],
      [3, 'c', true],
    ]);
  });

  test('2-tuple of different lengths', () => {
    const a = [1, 2];
    const b = ['a', 'b', 'c'];

    expect(zip(a, b)).toEqual([
      [1, 'a'],
      [2, 'b'],
    ]);
  });
});

describe('zipLongest', () => {
  test('same length', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];

    expect(zipLongest(undefined, a, b)).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  test('different lengths', () => {
    const a = [1, 2, 3];
    const b = [4];

    expect(zipLongest(undefined, a, b)).toEqual([
      [1, 4],
      [2, undefined],
      [3, undefined],
    ]);
  });
});
