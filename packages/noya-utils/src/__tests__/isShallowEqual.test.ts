import { isShallowEqual } from '../index';

// Currently these tests mirror the deep equal tests
describe('shallow', () => {
  describe('primitive values', () => {
    expect(isShallowEqual(42, 42)).toEqual(true);
    expect(isShallowEqual('foo', 'foo')).toEqual(true);
    expect(isShallowEqual(true, true)).toEqual(true);
    expect(isShallowEqual(false, false)).toEqual(true);
    expect(isShallowEqual(undefined, undefined)).toEqual(true);
    expect(isShallowEqual(null, null)).toEqual(true);
  });

  describe('arrays', () => {
    test('primitives', () => {
      expect(isShallowEqual([1, 2], [1, 2])).toEqual(true);
    });

    test('different lengths', () => {
      expect(isShallowEqual([1, 2], [1])).toEqual(false);
    });

    test('different objects', () => {
      expect(isShallowEqual([{}], [{}])).toEqual(false);
    });

    test('same objects', () => {
      let a = {};
      let b = {};
      expect(isShallowEqual([a, b], [a, b])).toEqual(true);
      expect(isShallowEqual([a, b], [b, a])).toEqual(false);
    });
  });

  describe('objects', () => {
    test('primitives', () => {
      expect(isShallowEqual({ foo: 123 }, { foo: 123 })).toEqual(true);
      expect(isShallowEqual({ foo: 123 }, { foo: 456 })).toEqual(false);
    });

    test('different keys', () => {
      expect(isShallowEqual({ foo: 123 }, { foo: 123, bar: 456 })).toEqual(
        false,
      );
    });

    test('different objects', () => {
      expect(isShallowEqual({ foo: {} }, { foo: {} })).toEqual(false);
    });

    test('same objects', () => {
      let a = {};
      let b = {};

      expect(isShallowEqual({ a, b }, { a, b })).toEqual(true);
    });
  });
});
