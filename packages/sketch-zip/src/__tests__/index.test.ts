import fs from 'fs';
import path from 'path';
import { parse } from '../index';

test('it should parse', async () => {
  const sketchFile = fs.readFileSync(
    path.join(__dirname, 'fixtures/Rectangle.sketch'),
  );

  const parsed = await parse(sketchFile);

  expect(parsed).toMatchSnapshot();
});
