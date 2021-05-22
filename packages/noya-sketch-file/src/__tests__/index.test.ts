import fs from 'fs';
import path from 'path';
import { decode, encode } from '../index';

const sketchFile = fs.readFileSync(
  path.join(__dirname, 'fixtures/Rectangle.sketch'),
);

test('it should decode', async () => {
  const decoded = await decode(sketchFile);

  expect(decoded).toMatchSnapshot();
});

// We decode, re-encode, and re-decode the fixture, making sure both decoded
// versions match. If they do our `encode` probably works correctly.
test('it should encode', async () => {
  const decoded = await decode(sketchFile);
  const encoded = await encode(decoded);
  const decoded2 = await decode(Buffer.from(encoded));

  expect(decoded).toEqual(decoded2);
});
