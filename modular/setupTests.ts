// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

import { CanvasKit, CanvasKitInit } from 'canvaskit-wasm';
import { VirtualConsole } from 'jsdom';
import path from 'path';

declare global {
  namespace NodeJS {
    interface Global {
      loadCanvasKit: () => Promise<CanvasKit>;
      _virtualConsole: VirtualConsole;
    }
  }
}

const initCanvasKit: typeof CanvasKitInit = require('canvaskit-wasm/bin/canvaskit.js');

global.loadCanvasKit = async () => {
  const pathToWasm = path.join(
    __dirname,
    '..',
    'node_modules',
    'canvaskit-wasm',
    'bin',
  );

  return await initCanvasKit({
    locateFile: (file: string) => path.join(pathToWasm, file),
  });
};
