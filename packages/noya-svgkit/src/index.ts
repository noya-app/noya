import { createJSPath } from './JSPath';
import { SVGKit } from './SVGKit';

export type SerializableProperties<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export async function PathKitInit() {
  const PathKitInit = require('pathkit-wasm/bin/pathkit.js');

  return PathKitInit({
    locateFile: (file: string) =>
      `https://unpkg.com/pathkit-wasm@0.7.0/bin/${file}`,
  });
}

export default async function loadSVGKit(PathKit?: any) {
  PathKit = PathKit ?? (await PathKitInit());

  (SVGKit as any).Path = createJSPath(PathKit);

  return SVGKit;
}
