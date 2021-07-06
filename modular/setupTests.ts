// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

import { CanvasKit, CanvasKitInit } from 'canvaskit';
import { PathKitInit } from 'pathkit';
import { VirtualConsole } from 'jsdom';
import path from 'path';

declare global {
  namespace NodeJS {
    interface Global {
      loadCanvasKit: () => Promise<CanvasKit>;
      loadPathKit: () => Promise<any>;
      _virtualConsole: VirtualConsole;
    }
  }
}

const pathToWasm = path.join(
  __dirname,
  '..',
  'packages',
  'app',
  'public',
  'wasm',
);

global.loadCanvasKit = async () => {
  return await CanvasKitInit({
    locateFile: (file: string) => path.join(pathToWasm, file),
  });
};

global.loadPathKit = async () => {
  return await PathKitInit({
    locateFile: (file: string) => path.join(pathToWasm, file),
  });
};
