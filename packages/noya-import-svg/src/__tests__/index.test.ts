import fs from 'fs';
import { debugDescription } from 'noya-sketch-model';
import path from 'path';
import { svgToLayer } from '..';

const circleSvg = fs.readFileSync(path.join(__dirname, 'circle.svg'), 'utf8');
const demoSvg = fs.readFileSync(path.join(__dirname, 'demo.svg'), 'utf8');
const bowtieSvg = fs.readFileSync(path.join(__dirname, 'bowtie.svg'), 'utf8');
const bowtieViewBox = fs.readFileSync(
  path.join(__dirname, 'bowtie-viewbox.svg'),
  'utf8',
);

test('makes layers', () => {
  const rootLayer = svgToLayer(circleSvg);

  expect(
    debugDescription(rootLayer, {
      style: true,
      fills: true,
      borders: true,
      points: true,
    }),
  ).toMatchSnapshot();
});

test('makes demo layers', () => {
  const rootLayer = svgToLayer(demoSvg);

  expect(debugDescription(rootLayer)).toMatchSnapshot();
});

test('makes multiple shapePaths in a shapeGroup', () => {
  const rootLayer = svgToLayer(bowtieSvg);

  expect(debugDescription(rootLayer, { points: true })).toMatchSnapshot();
});

test('uses viewbox', () => {
  const rootLayer = svgToLayer(bowtieViewBox);

  expect(debugDescription(rootLayer, { points: true })).toMatchSnapshot();
});
