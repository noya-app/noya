import { isShallowEqual } from '../index';

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
  });

  test('different keys', () => {
    expect(isShallowEqual({ foo: 123 }, { foo: 123, bar: 456 })).toEqual(false);
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
