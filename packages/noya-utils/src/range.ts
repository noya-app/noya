// Adapted from lodash (MIT): https://github.com/lodash/lodash/blob/4.17.15/lodash.js#L6839

/**
 * Creates an array of numbers (positive and/or negative) progressing from start up to,
 * but not including, end. A step of -1 is used if a negative start is specified without
 * an end or step. If end is not specified, it's set to start with start then set to 0.
 *
 * @param {number} start The start of the range.
 * @param {number} end The end of the range.
 * @param {number} step The value to increment or decrement by.
 * @returns {Array} Returns the range of numbers.
 */
export function range(start: number, end?: number, step?: number) {
  if (end === undefined) {
    end = start;
    start = 0;
  }

  step = step ?? (start < end ? 1 : -1);

  let index = -1;
  let length = Math.max(Math.ceil((end - start) / (step || 1)), 0);
  let result = Array(length);

  while (length--) {
    result[++index] = start;
    start += step;
  }

  return result;
}
