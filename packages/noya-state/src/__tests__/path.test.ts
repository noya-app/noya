import type { CanvasKit as CanvasKitType } from 'canvaskit';
import { VirtualConsole } from 'jsdom';
import { loadCanvasKit } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import { path } from '../primitives/path';

let CanvasKit: CanvasKitType;

const originalVirtualConsole: VirtualConsole = global._virtualConsole;

beforeAll(async () => {
  global._virtualConsole = new VirtualConsole();

  CanvasKit = await loadCanvasKit();
});

afterAll(() => {
  global._virtualConsole = originalVirtualConsole;
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
