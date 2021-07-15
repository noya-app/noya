import { SketchModel } from '../index';

jest.mock('noya-utils', () => {
  const uuid = () => '0';
  const original = jest.requireActual('noya-utils');
  return { ...original, uuid };
});

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

test('creates rectangles', () => {
  expect(SketchModel.rectangle()).toMatchSnapshot();
});

test('creates ovals', () => {
  expect(SketchModel.oval()).toMatchSnapshot();
});

test('creates bitmaps', () => {
  expect(SketchModel.bitmap()).toMatchSnapshot();
});

test('creates texts', () => {
  expect(SketchModel.text()).toMatchSnapshot();
});

test('creates shapePaths', () => {
  expect(SketchModel.shapePath()).toMatchSnapshot();
});

test('creates groups', () => {
  expect(SketchModel.group()).toMatchSnapshot();
});

test('creates artboards', () => {
  expect(SketchModel.artboard()).toMatchSnapshot();
});

test('creates symbolMasters', () => {
  expect(SketchModel.symbolMaster()).toMatchSnapshot();
});

test('creates symbolInstances', () => {
  expect(SketchModel.symbolInstance({ symbolID: '1' })).toMatchSnapshot();
});
