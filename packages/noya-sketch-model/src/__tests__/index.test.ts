import { SketchModel } from '../index';

test('creates colors', () => {
  expect(SketchModel.color()).toMatchSnapshot();
});

test('creates gradients', () => {
  expect(SketchModel.gradient()).toMatchSnapshot();
});

test('creates graphicsContextSettings', () => {
  expect(SketchModel.graphicsContextSettings()).toMatchSnapshot();
});

test('creates borders', () => {
  expect(SketchModel.border()).toMatchSnapshot();
});

test('creates fills', () => {
  expect(SketchModel.fill()).toMatchSnapshot();
});
