export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}
/**
 * Source: modified version of underscore.js implementation
 * https://stackoverflow.com/questions/27078285/simple-throttle-in-javascript
 * https://underscorejs.org/docs/modules/throttle.html
 **/

/**
 * Returns a function, that, when invoked, will only be triggered at most once
 * during a given window of time. Normally, the throttled function will run
 * as much as it can, without ever going more than once per `wait` duration;
 * but if you'd like to disable the execution on the leading edge, pass
 * `{leading: false}`. To disable execution on the trailing edge, ditto.
 *
 * @param func
 * @param wait
 * @param options
 * @returns
 */
export function throttle<T extends Function>(
  func: T,
  wait: number,
  options: ThrottleOptions = {},
): T {
  let context: any;
  let args: any;
  let result: any;
  let timeout: number | null = null;
  let previous = 0;

  const later = function () {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  return function () {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    // @ts-ignore
    context = this;

    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      // @ts-ignore for some reason mobile requires it to be Timeout while web requires number
      timeout = setTimeout(later, remaining);
    }
    return result;
  } as unknown as T;
}
