import { delimitedPath } from '../index';

const { basename, dirname, join } = delimitedPath;

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

test('join', () => {
  expect(join(['foo'])).toEqual('foo');
  expect(join(['bar', 'foo'])).toEqual('bar/foo');
  expect(join(['bar', 'baz', 'foo'])).toEqual('bar/baz/foo');

  expect(join([''])).toEqual('');
  expect(join(['bar', '', 'foo'])).toEqual('bar/foo');
  expect(join(['bar', undefined, 'foo'])).toEqual('bar/foo');
});
