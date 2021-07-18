/**
 * This fixes a bundling issue where `exports` isn't defined in the production
 * build, and as a result the required module doesn't load correctly.
 *
 * Since the module also looks for an amd `define` function, we can get access
 * to the exports that way in a production build.
 */
export function emscriptenRequireInterop<T>(requireFunction: () => T) {
  return new Promise<T>((resolve) => {
    function amdDefine(_deps: unknown[], thunk: () => T) {
      resolve(thunk());
    }

    amdDefine['amd'] = true;

    (window as any).define = amdDefine;

    const result = requireFunction();

    // If the result is a function, call it.
    // Otherwise, we wait for the amdDefine to resolve.
    if (typeof result === 'function') {
      resolve(result);
    }
  });
}
