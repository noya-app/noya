// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

import path from 'path';
import fs from 'fs';
import { setPathToWasm } from 'noya-utils';
import nock from 'nock';

const pathToWasm = path.join(
  __dirname,
  '..',
  'packages',
  'app',
  'public',
  'wasm',
);

setPathToWasm(pathToWasm);

// Mock the http requests for wasm files
nock('http://localhost')
  .get(/.wasm$/)
  .reply(200, (uri) => {
    const match = uri.match(/([^/]+).wasm$/g);

    if (!match) throw new Error(`Bad nock url: ${uri}`);

    return fs.createReadStream(path.join(pathToWasm, match[0]));
  })
  .persist();
