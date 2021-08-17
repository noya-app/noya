// TypeScript will be adding an official `TupleOf` utility type, which will
// be more performant in the case of a large N, but in the meantime, we can
// use this one.
// https://github.com/microsoft/TypeScript/pull/40002
// https://github.com/piotrwitek/utility-types/pull/162
export type TupleOf<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;

type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

export type Brand<K, T> = K & { __brand: T };
