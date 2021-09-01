import { decodeQueryParameters, parseUrl } from '../url';

test('parse url', () => {
  const result = parseUrl('https://noya.design?foo=bar&a=123#hello');

  expect(result).toEqual({
    pathname: '/',
    query: 'foo=bar&a=123',
    fragment: 'hello',
  });
});

test('parse query parameters', () => {
  const result = parseUrl('https://noya.design?foo=bar&a=123#hello');
  const parameters = decodeQueryParameters(result.query);

  expect(parameters).toEqual({
    foo: 'bar',
    a: '123',
  });
});
