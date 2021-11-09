// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

import path from 'path';
import fs from 'fs';
import { setPathToWasm } from 'noya-utils';
import nock from 'nock';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import util from 'util';

expect.extend({ toMatchImageSnapshot });

// https://reactjs.org/docs/testing-environments.html#mocking-a-rendering-surface
jest.mock('scheduler', () => require('scheduler/unstable_mock'));

// Polyfills for node
window.TextEncoder = window.TextEncoder ?? util.TextEncoder;
window.TextDecoder = window.TextDecoder ?? util.TextDecoder;
File.prototype.arrayBuffer = File.prototype.arrayBuffer || arrayBuffer;
Blob.prototype.arrayBuffer = Blob.prototype.arrayBuffer || arrayBuffer;

function arrayBuffer(this: Blob) {
  return new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.readAsArrayBuffer(this);
  });
}

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
