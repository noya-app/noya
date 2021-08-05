import type { CanvasKit as CanvasKitType, Path } from 'canvaskit';
import { loadCanvasKit } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import { round } from 'noya-utils';
import { parsePathCmds, path, PathCommandVerb } from '../primitives/path';

let CanvasKit: CanvasKitType;

beforeAll(async () => {
  CanvasKit = await loadCanvasKit();
});

function describePathCommand([verb, ...args]: [PathCommandVerb, ...number[]]) {
  const verbName = {
    [PathCommandVerb.move]: 'move',
    [PathCommandVerb.line]: 'line',
    [PathCommandVerb.quad]: 'quad',
    [PathCommandVerb.conic]: 'conic',
    [PathCommandVerb.cubic]: 'cubic',
    [PathCommandVerb.close]: 'close',
  } as const;

  return `${verbName[verb]}(${args.map((n) => round(n, 2)).join(', ')})`;
}

function describePath(path: Path) {
  return parsePathCmds(path.toCmds()).map(describePathCommand);
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
