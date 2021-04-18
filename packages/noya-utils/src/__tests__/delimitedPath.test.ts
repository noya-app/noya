import { delimitedPath } from '../index';

const { basename, dirname } = delimitedPath;

test('basename', () => {
  expect(basename('foo')).toEqual('foo');
  expect(basename('bar/foo')).toEqual('foo');
  expect(basename('bar/baz/foo')).toEqual('foo');

  expect(basename('')).toEqual('');
  expect(basename('/')).toEqual('');
  expect(basename('bar/')).toEqual('');
});

test('dirname', () => {
  expect(dirname('foo')).toEqual('');
  expect(dirname('bar/foo')).toEqual('bar');
  expect(dirname('bar/baz/foo')).toEqual('bar/baz');

  expect(dirname('')).toEqual('');
  expect(dirname('/')).toEqual('');
  expect(dirname('bar/')).toEqual('bar');
});
