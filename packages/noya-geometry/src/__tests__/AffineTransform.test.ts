import type { CanvasKit as CanvasKitType } from 'canvaskit';
import { loadCanvasKit } from 'noya-renderer';
import { AffineTransform } from '../AffineTransform';
import { toRadians } from '../radians';

let CanvasKit: CanvasKitType;

beforeAll(async () => {
  CanvasKit = await loadCanvasKit();
});

test('matches canvaskit', () => {
  expect(AffineTransform.identity.array).toEqual(CanvasKit.Matrix.identity());
  expect(AffineTransform.translate(2, 3).array).toEqual(
    CanvasKit.Matrix.translated(2, 3),
  );
  expect(AffineTransform.scale(2, 3).array).toEqual(
    CanvasKit.Matrix.scaled(2, 3),
  );
  expect(AffineTransform.rotate(toRadians(90)).array).toEqual(
    CanvasKit.Matrix.rotated(toRadians(90)),
  );
  expect(
    AffineTransform.rotate(toRadians(90), { x: 2, y: 3 }).array.map((x) =>
      x.toPrecision(6),
    ),
  ).toEqual(
    CanvasKit.Matrix.rotated(toRadians(90), 2, 3).map((x) => x.toPrecision(6)),
  );
  expect(
    AffineTransform.multiply(
      AffineTransform.rotate(toRadians(90)),
      AffineTransform.translate(2, 3),
    ).array,
  ).toEqual(
    CanvasKit.Matrix.multiply(
      CanvasKit.Matrix.rotated(toRadians(90)),
      CanvasKit.Matrix.translated(2, 3),
    ),
  );
});

test('identity', () => {
  expect(AffineTransform.identity.array).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
});

test('returns float32Array', () => {
  expect(new AffineTransform([1, 2, 3, 4, 5, 6]).float32Array).toEqual(
    new Float32Array([1, 2, 3, 4, 5, 6, 0, 0, 1]),
  );
});

test('scale', () => {
  const point = { x: 1, y: 1 };

  expect(AffineTransform.scale(2).applyTo(point)).toEqual({ x: 2, y: 2 });
  expect(AffineTransform.scale(2, 1).applyTo(point)).toEqual({ x: 2, y: 1 });
  expect(AffineTransform.scale(1, 2).applyTo(point)).toEqual({ x: 1, y: 2 });
});

test('translate', () => {
  const point = { x: 1, y: 1 };

  expect(AffineTransform.translate(2, 3).applyTo(point)).toEqual({
    x: 3,
    y: 4,
  });
});

test('rotate', () => {
  const point = { x: 1, y: 1 };
  const rotated90 = AffineTransform.rotate(toRadians(90)).applyTo(point);
  const rotated180 = AffineTransform.rotate(toRadians(180)).applyTo(point);

  expect(rotated90.x).toBeCloseTo(-1);
  expect(rotated90.y).toBeCloseTo(1);

  expect(rotated180.x).toBeCloseTo(-1);
  expect(rotated180.y).toBeCloseTo(-1);
});

test('rotate around point', () => {
  const point = { x: 1, y: 1 };
  const rotated90 = AffineTransform.rotate(toRadians(90), {
    x: 10,
    y: 10,
  }).applyTo(point);
  const rotated180 = AffineTransform.rotate(toRadians(180), {
    x: 10,
    y: 10,
  }).applyTo(point);

  expect(rotated90.x).toBeCloseTo(19);
  expect(rotated90.y).toBeCloseTo(1);

  expect(rotated180.x).toBeCloseTo(19);
  expect(rotated180.y).toBeCloseTo(19);
});

test('prepend and append', () => {
  const translate = AffineTransform.translate(10, 5);
  const scale = AffineTransform.scale(2, 3);

  expect(translate.prepend(scale).array).toEqual([2, 0, 10, 0, 3, 5, 0, 0, 1]);
  expect(translate.append(scale).array).toEqual([2, 0, 20, 0, 3, 15, 0, 0, 1]);
});

test('multiply performs prepend', () => {
  const translate = AffineTransform.translate(10, 5);
  const scale = AffineTransform.scale(2, 3);

  expect(AffineTransform.multiply(scale, translate).array).toEqual(
    scale.prepend(translate).array,
  );
});

describe('chaining', () => {
  test('scale then translate', () => {
    const transform = AffineTransform.scale(100).translate(10, 5).array;
    const expected = [100, 0, 1000, 0, 100, 500, 0, 0, 1];
    expect(transform).toEqual(expected);
  });

  test('translate then scale', () => {
    const transform = AffineTransform.translate(10, 5).scale(100).array;
    const expected = [100, 0, 10, 0, 100, 5, 0, 0, 1];
    expect(transform).toEqual(expected);
  });
});
