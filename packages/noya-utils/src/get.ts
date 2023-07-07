/**
 * Access a nested property on an object by path.
 *
 * Examples
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
export function get<T = any>(
  object: any,
  path: string | string[],
): T | undefined;
export function get<T = any>(
  object: any,
  path: string | string[],
  defaultValue: T,
): T;
export function get<T = any>(
  object: any,
  path: string | string[],
  defaultValue?: T,
) {
  if (object === null || object === undefined) return defaultValue;

  const pathArray = Array.isArray(path) ? path : path.split('.');

  let index = 0;
  let length = path.length;

  while (object != null && index < length) {
    object = object[pathArray[index++]];
  }

  return index && index === length ? object : defaultValue;
}
