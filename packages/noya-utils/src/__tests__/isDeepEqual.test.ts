import { isDeepEqual } from '../index';

// Currently these tests mirror the shallow equal tests
describe('deep', () => {
  test('primitive values', () => {
    expect(isDeepEqual(42, 42)).toEqual(true);
    expect(isDeepEqual('foo', 'foo')).toEqual(true);
    expect(isDeepEqual(true, true)).toEqual(true);
    expect(isDeepEqual(false, false)).toEqual(true);
    expect(isDeepEqual(undefined, undefined)).toEqual(true);
    expect(isDeepEqual(null, null)).toEqual(true);
  });

  describe('arrays', () => {
    test('primitives', () => {
      expect(isDeepEqual([1, 2], [1, 2])).toEqual(true);
    });

    test('different lengths', () => {
      expect(isDeepEqual([1, 2], [1])).toEqual(false);
    });

    test('different objects', () => {
      expect(isDeepEqual([{}], [{}])).toEqual(true);
    });

    test('same objects', () => {
      const a = {};
      const b = {};
      expect(isDeepEqual([a, b], [a, b])).toEqual(true);
      expect(isDeepEqual([a, b], [b, a])).toEqual(true);
    });
  });

  describe('objects', () => {
    test('primitives', () => {
      expect(isDeepEqual({ foo: 123 }, { foo: 123 })).toEqual(true);
      expect(isDeepEqual({ foo: 123 }, { foo: 456 })).toEqual(false);
    });

    test('different keys', () => {
      expect(isDeepEqual({ foo: 123 }, { foo: 123, bar: 456 })).toEqual(false);
    });

    test('different objects', () => {
      expect(isDeepEqual({ foo: {} }, { foo: {} })).toEqual(true);
    });

    test('same objects', () => {
      const a = {};
      const b = {};

      expect(isDeepEqual({ a, b }, { a, b })).toEqual(true);
    });
  });
});
