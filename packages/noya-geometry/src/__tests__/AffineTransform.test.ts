import { isNumberEqual } from 'noya-utils';
import { AffineTransform } from '../AffineTransform';
import { toRadians } from '../utils';

test('returns float32Array', () => {
  expect(new AffineTransform([1, 2, 3, 4, 5, 6]).float32Array).toEqual(
    new Float32Array([1, 2, 3, 4, 5, 6, 0, 0, 1]),
  );
});

test('scales', () => {
  const point = { x: 1, y: 1 };

  expect(AffineTransform.scale(2).applyTo(point)).toEqual({ x: 2, y: 2 });
  expect(AffineTransform.scale(2, 1).applyTo(point)).toEqual({ x: 2, y: 1 });
  expect(AffineTransform.scale(1, 2).applyTo(point)).toEqual({ x: 1, y: 2 });
});

test('rotates', () => {
  const point = { x: 1, y: 1 };
  const rotated90 = AffineTransform.rotation(toRadians(90)).applyTo(point);
  const rotated180 = AffineTransform.rotation(toRadians(180)).applyTo(point);

  expect(
    isNumberEqual(rotated90.x, -1) && isNumberEqual(rotated90.y, 1),
  ).toEqual(true);

  expect(
    isNumberEqual(rotated180.x, -1) && isNumberEqual(rotated180.y, -1),
  ).toEqual(true);
});

test('rotates around point', () => {
  const point = { x: 1, y: 1 };
  const rotated90 = AffineTransform.rotation(toRadians(90), 10, 10).applyTo(
    point,
  );
  const rotated180 = AffineTransform.rotation(toRadians(180), 10, 10).applyTo(
    point,
  );

  expect(
    isNumberEqual(rotated90.x, 19) && isNumberEqual(rotated90.y, 1),
  ).toEqual(true);

  expect(
    isNumberEqual(rotated180.x, 19) && isNumberEqual(rotated180.y, 19),
  ).toEqual(true);
});
