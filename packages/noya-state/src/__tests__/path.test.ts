import type { CanvasKit as CanvasKitType, Path, PathCommand } from 'canvaskit';
import { loadCanvasKit } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import { round } from 'noya-utils';
import { path } from '../primitives/path';

let CanvasKit: CanvasKitType;

beforeAll(async () => {
  CanvasKit = await loadCanvasKit();
});

function describePathCommand([verb, ...args]: PathCommand) {
  const verbName = {
    [CanvasKit.MOVE_VERB]: 'move',
    [CanvasKit.LINE_VERB]: 'line',
    [CanvasKit.QUAD_VERB]: 'quad',
    [CanvasKit.CONIC_VERB]: 'conic',
    [CanvasKit.CUBIC_VERB]: 'cubic',
    [CanvasKit.CLOSE_VERB]: 'close',
  } as const;

  return `${verbName[verb]}(${args.map((n) => round(n, 2)).join(', ')})`;
}

function describePath(path: Path) {
  return path.toCmds().map(describePathCommand);
}

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

  expect(describePath(result)).toMatchSnapshot();
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

  expect(describePath(result)).toMatchSnapshot();
});

test('oval', () => {
  const oval = SketchModel.oval({
    frame: SketchModel.rect({ x: 0, y: 0, width: 100, height: 100 }),
  });

  const result = path(CanvasKit, oval.points, oval.frame, oval.isClosed);

  expect(describePath(result)).toMatchSnapshot();
});
