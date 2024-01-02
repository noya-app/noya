import { SketchModel } from 'noya-sketch-model';
import {
  getLayerSnapValues,
  getSnapAdjustmentDistance,
  getSnaps,
  getSnapValues,
} from '../snapping';

let mockInitialId = 0;

beforeEach(() => {
  mockInitialId = 0;
});

jest.mock('@noya-app/noya-utils', () => {
  const uuid = () => (mockInitialId++).toString();
  const original = jest.requireActual('@noya-app/noya-utils');
  return { ...original, uuid };
});

test('axis values', () => {
  const rect = { x: 20, y: -50, width: 80, height: 100 };

  const xs = getSnapValues(rect, 'x');
  const ys = getSnapValues(rect, 'y');

  expect(xs).toEqual([20, 60, 100]);
  expect(ys).toEqual([-50, 0, 50]);
});

test('get layer axis info', () => {
  const rectangle = SketchModel.rectangle({
    frame: SketchModel.rect({ x: 20, y: -50, width: 80, height: 100 }),
  });
  const page = SketchModel.page({
    layers: [rectangle],
  });

  const xs = getLayerSnapValues(page, rectangle.do_objectID, 'x');
  const ys = getLayerSnapValues(page, rectangle.do_objectID, 'y');

  expect(xs).toEqual([20, 60, 100]);
  expect(ys).toEqual([-50, 0, 50]);
});

test('snapping pairs', () => {
  const source = SketchModel.rectangle({
    frame: SketchModel.rect({ x: 0, y: 0, width: 100, height: 100 }),
  });
  const target = SketchModel.oval({
    frame: SketchModel.rect({ x: 0, y: 104, width: 100, height: 100 }),
  });
  const page = SketchModel.page({
    layers: [source, target],
  });

  const sourceXs = getSnapValues(source.frame, 'x');
  const sourceYs = getSnapValues(source.frame, 'y');

  const targetXs = getLayerSnapValues(page, target.do_objectID, 'x');
  const targetYs = getLayerSnapValues(page, target.do_objectID, 'y');

  const xPairs = getSnaps(sourceXs, targetXs, target.do_objectID);
  const yPairs = getSnaps(sourceYs, targetYs, target.do_objectID);

  expect({ xPairs, yPairs }).toMatchSnapshot();

  const x = getSnapAdjustmentDistance(xPairs, 1);
  const y = getSnapAdjustmentDistance(yPairs, 1);

  expect({ x, y }).toMatchSnapshot();
});
