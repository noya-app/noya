export function isEqualArray<T>(
  a: T[],
  b: T[],
  deep: boolean,
  ignoreUndefinedKeys: boolean,
) {
  if (a === b) return true;

  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (
      !(deep ? isEqual(a[i], b[i], deep, ignoreUndefinedKeys) : a[i] === b[i])
    ) {
      return false;
    }
  }

  return true;
}

function isEqualObject<T extends Record<PropertyKey, any>>(
  a: T,
  b: T,
  deep: boolean,
  ignoreUndefinedKeys: boolean,
) {
  if (a === b) return true;

  if (!a || !b) return false;

  let aKeys = Object.keys(a);
  let bKeys = Object.keys(b);

  if (ignoreUndefinedKeys) {
    aKeys = aKeys.filter((key) => a[key] !== undefined);
    bKeys = bKeys.filter((key) => b[key] !== undefined);
  }

  if (aKeys.length !== bKeys.length) return false;

  for (let i = 0; i < aKeys.length; i++) {
    const key = aKeys[i];

    if (
      !(deep
        ? isEqual(a[key], b[key], deep, ignoreUndefinedKeys)
        : a[key] === b[key]) ||
      !Object.prototype.hasOwnProperty.call(b, key)
    ) {
      return false;
    }
  }

  return true;
}

export function isEqual<T>(
  a: T,
  b: T,
  deep: boolean,
  ignoreUndefinedKeys: boolean,
) {
  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) return false;

  // Handle non-objects and null/undefined
  if (aType !== 'object' || !a || !b) return a === b;

  if (a instanceof Array && b instanceof Array) {
    return isEqualArray(a, b, deep, ignoreUndefinedKeys);
  }

  return isEqualObject(a, b, deep, ignoreUndefinedKeys);
}
