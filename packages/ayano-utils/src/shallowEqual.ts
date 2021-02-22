function isShallowEqualArray<T>(a: T[], b: T[]) {
  if (a === b) return true;

  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

function isShallowEqualObject<T extends Record<string, any>>(a: T, b: T) {
  if (a === b) return true;

  if (!a || !b) return false;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) return false;

  for (let i = 0; i < aKeys.length; i++) {
    const key = aKeys[i];

    if (a[key] !== b[key] || !Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
  }

  return true;
}

export function isShallowEqual<T>(a: T, b: T) {
  const aType = typeof a;
  const bType = typeof b;

  if (aType !== bType) return false;

  if (aType !== 'object') return a === b;

  if (a instanceof Array && b instanceof Array) {
    return isShallowEqualArray(a, b);
  }

  return isShallowEqualObject(a, b);
}
