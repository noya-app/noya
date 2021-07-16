import fs from 'fs';
import { Layers } from 'noya-state';
import path from 'path';
import { svgToLayer } from '..';

const circleSvg = fs.readFileSync(path.join(__dirname, 'circle.svg'), 'utf8');

test('makes layers', () => {
  const rootLayer = svgToLayer(circleSvg);

  expect(
    Layers.summary(rootLayer, { fills: true, borders: true }),
  ).toMatchSnapshot();
});
