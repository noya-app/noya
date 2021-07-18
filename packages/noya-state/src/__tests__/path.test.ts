import type { CanvasKit as CanvasKitType } from 'canvaskit';
import { loadCanvasKit } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import { path } from '../primitives/path';

let CanvasKit: CanvasKitType;

beforeAll(async () => {
  CanvasKit = await loadCanvasKit();
});

test('rectangle', () => {
  const rectangle = SketchModel.rectangle({
    frame: SketchModel.rect({ x: 0, y: 0, width: 100, height: 100 }),
  });

  const result = path(
    CanvasKit,
    rectangle.points,
    rectangle.frame,
    rectangle.isClosed,
  );

  expect(result.toSVGString()).toMatchSnapshot();
});

test('rounded rectangle', () => {
  const rectangle = SketchModel.rectangle({
    frame: SketchModel.rect({ x: 0, y: 0, width: 100, height: 100 }),
    fixedRadius: 10,
  });

  const result = path(
    CanvasKit,
    rectangle.points,
    rectangle.frame,
    rectangle.isClosed,
  );

  expect(result.toSVGString()).toMatchSnapshot();
});

test('oval', () => {
  const oval = SketchModel.oval({
    frame: SketchModel.rect({ x: 0, y: 0, width: 100, height: 100 }),
  });

  const result = path(CanvasKit, oval.points, oval.frame, oval.isClosed);

  expect(result.toSVGString()).toMatchSnapshot();
});
