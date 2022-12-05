import { getPublicPath } from 'noya-public-path';
import { PathKitInit } from 'pathkit';
import { createJSPath } from './JSPath';
import { SVGKit } from './SVGKit';

export type SerializableProperties<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

let loadingPromise: Promise<typeof SVGKit> | undefined = undefined;

export default function loadSVGKit() {
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise(async (resolve) => {
    const PathKit = await PathKitInit({
      locateFile: (file: string) => getPublicPath() + 'wasm/' + file,
    });

    (SVGKit as any).Path = createJSPath(PathKit);

    resolve(SVGKit);
  });

  return loadingPromise;
}
