import fs from 'fs';
import { Layers } from 'noya-state';
import path from 'path';
import { svgToLayer } from '..';

const circleSvg = fs.readFileSync(path.join(__dirname, 'circle.svg'), 'utf8');
const demoSvg = fs.readFileSync(path.join(__dirname, 'demo.svg'), 'utf8');
const bowtieSvg = fs.readFileSync(path.join(__dirname, 'bowtie.svg'), 'utf8');

test('makes layers', () => {
  const rootLayer = svgToLayer(circleSvg);

  expect(
    Layers.summary(rootLayer, { fills: true, borders: true }),
  ).toMatchSnapshot();
});

test('makes demo layers', () => {
  const rootLayer = svgToLayer(demoSvg);

  expect(Layers.summary(rootLayer)).toMatchSnapshot();
});

test('makes multiple shapePaths in a shapeGroup', () => {
  const rootLayer = svgToLayer(bowtieSvg);

  expect(Layers.summary(rootLayer)).toMatchSnapshot();
});
