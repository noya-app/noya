export * from './isShallowEqual';
export * from './isDeepEqual';
export * from './isNumberEqual';
export * from './zip';
export * from './clamp';
export * from './lerp';
export * from './sum';
export * from './round';
export * from './range';
export * from './cartesianProduct';
export * from './windowsOf';
export * from './sortBy';
export * from './chunkBy';
export * from './groupBy';
export * from './getIncrementedName';
export * from './interpolate';
export * from './rotate';
export * from './invert';
export * from './base64';
export * from './utf16';
export * from './fileType';
export * from './memoize';
export * from './types';
export * from './upperFirst';
export * from './unique';
export * from './url';
export * as delimitedPath from './delimitedPath';

// Consider moving these to a more React-specific package
export * from './PromiseState';
export * from './SuspendedValue';

// These are exposed for simpler dependency injection in tests
// Consider moving to a separate package
let PATH_TO_WASM = '/wasm/';

export function getPathToWasm() {
  return PATH_TO_WASM;
}

export function setPathToWasm(path: string) {
  PATH_TO_WASM = path + '/';
}

export { v4 as uuid } from 'uuid';
