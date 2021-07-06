import { createJSPath } from './JSPath';
import { SVGKit } from './SVGKit';
import { PathKitInit } from 'pathkit';

export type SerializableProperties<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export default async function loadSVGKit(PathKit?: any) {
  PathKit =
    PathKit ??
    (await PathKitInit({
      locateFile: (file: string) => '/wasm/' + file,
    }));

  (SVGKit as any).Path = createJSPath(PathKit);

  return SVGKit;
}
