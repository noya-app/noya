import { createBounds } from 'noya-geometry';
import { SketchModel } from 'noya-sketch-model';
import {
  findSmallestSnappingDistance,
  getAxisValues,
  getLayerAxisInfo,
  getSnappingPairs,
} from '../snapping';

let mockInitialId = 0;

jest.mock('noya-utils', () => {
  const uuid = () => (mockInitialId++).toString();
  const original = jest.requireActual('noya-utils');
  return { ...original, uuid };
});

beforeEach(() => {
  mockInitialId = 0;
});

test('axis values', () => {
  const bounds = createBounds({ x: 20, y: -50, width: 80, height: 100 });

  expect(getAxisValues(bounds, 'x')).toEqual([20, 60, 100]);
  expect(getAxisValues(bounds, 'y')).toEqual([-50, 0, 50]);
});

test('get layer axis info', () => {
  const rectangle = SketchModel.rectangle({
    frame: SketchModel.rect({ x: 20, y: -50, width: 80, height: 100 }),
  });
  const page = SketchModel.page({
    layers: [rectangle],
  });

  const info = getLayerAxisInfo(page, [rectangle]);

  expect(info).toEqual([
    {
      layerId: rectangle.do_objectID,
      x: [20, 60, 100],
      y: [-50, 0, 50],
    },
  ]);
});

test('snapping pairs', () => {
  const rectangle = SketchModel.rectangle({
    frame: SketchModel.rect({ x: 0, y: 0, width: 100, height: 100 }),
  });
  const oval = SketchModel.oval({
    frame: SketchModel.rect({ x: 0, y: 104, width: 100, height: 100 }),
  });
  const page = SketchModel.page({
    layers: [rectangle, oval],
  });

  const ovalInfo = getLayerAxisInfo(page, [oval]);

  expect(ovalInfo).toEqual([
    {
      layerId: oval.do_objectID,
      x: [0, 50, 100],
      y: [104, 154, 204],
    },
  ]);

  const selectedBounds = createBounds(rectangle.frame);
  const possibleSnapInfos = getLayerAxisInfo(page, [oval]);

  const xValues = getAxisValues(selectedBounds, 'x');
  const yValues = getAxisValues(selectedBounds, 'y');

  const xPairs = getSnappingPairs(xValues, possibleSnapInfos, 'x');
  const yPairs = getSnappingPairs(yValues, possibleSnapInfos, 'y');

  expect({ xPairs, yPairs }).toMatchSnapshot();

  const x = findSmallestSnappingDistance(xPairs);
  const y = findSmallestSnappingDistance(yPairs);

  expect({ x, y }).toMatchSnapshot();
});
