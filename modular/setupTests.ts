// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

import { VirtualConsole } from 'jsdom';
import path from 'path';
import { setPathToWasm } from 'noya-utils';

declare global {
  namespace NodeJS {
    interface Global {
      _virtualConsole: VirtualConsole;
    }
  }
}

setPathToWasm(path.join(__dirname, '..', 'packages', 'app', 'public', 'wasm'));
