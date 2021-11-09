import { ClipboardUtils } from '../clipboard';

test('serializes to json', () => {
  const value = { a: 123 };
  const encoded = ClipboardUtils.toEncodedHTML(value);
  const decoded = ClipboardUtils.fromEncodedHTML(encoded);
  expect(value).toEqual(decoded);
});
