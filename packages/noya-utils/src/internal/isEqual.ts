export function isEqualArray<T>(a: T[], b: T[], deep: boolean) {
  if (a === b) return true;

  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (!(deep ? isEqual(a[i], b[i], deep) : a[i] === b[i])) {
      return false;
    }
  }

  return true;
}

function isEqualObject<T extends Record<PropertyKey, any>>(
  a: T,
  b: T,
  deep: boolean,
) {
  if (a === b) return true;

  if (!a || !b) return false;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) return false;

  for (let i = 0; i < aKeys.length; i++) {
    const key = aKeys[i];

    if (
      !(deep ? isEqual(a[key], b[key], deep) : a[key] === b[key]) ||
      !Object.prototype.hasOwnProperty.call(b, key)
    ) {
      return false;
    }
  }

  return true;
}

export function isEqual<T>(a: T, b: T, deep: boolean) {
  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) return false;

  // Handle non-objects and null/undefined
  if (aType !== 'object' || !a || !b) return a === b;

  if (a instanceof Array && b instanceof Array) {
    return isEqualArray(a, b, deep);
  }

  return isEqualObject(a, b, deep);
}
