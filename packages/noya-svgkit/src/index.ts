import { createJSPath } from './JSPath';
import { SVGKit } from './SVGKit';
import { PathKitInit } from 'pathkit';

export type SerializableProperties<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

let loadingPromise: Promise<typeof SVGKit> | undefined = undefined;

export default function loadSVGKit(PathKit?: any) {
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise(async (resolve) => {
    PathKit =
      PathKit ??
      (await PathKitInit({
        locateFile: (file: string) => '/wasm/' + file,
      }));

    (SVGKit as any).Path = createJSPath(PathKit);

    resolve(SVGKit);
  });

  return loadingPromise;
}
