import {
  getLinePercentage,
  getClosestPointOnLine,
  isPointInLine,
} from '../line';
import { Point } from '../types';

describe('perpendicular point on line', () => {
  test('line', () => {
    expect(
      getClosestPointOnLine({ x: 0, y: 10 }, [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ]),
    ).toEqual({ x: 5, y: 5 });
  });

  test('horizontal line', () => {
    expect(
      getClosestPointOnLine({ x: 5, y: 5 }, [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ]),
    ).toEqual({ x: 5, y: 0 });
  });

  test('vertical line', () => {
    expect(
      getClosestPointOnLine({ x: 5, y: 5 }, [
        { x: 0, y: 0 },
        { x: 0, y: 10 },
      ]),
    ).toEqual({ x: 0, y: 5 });
  });

  test('point already on line', () => {
    expect(
      getClosestPointOnLine({ x: 0, y: 0 }, [
        { x: 0, y: 0 },
        { x: 0, y: 10 },
      ]),
    ).toEqual({ x: 0, y: 0 });
  });
});

describe('percent on line', () => {
  test('horizontal line', () => {
    const horizontalLine: [Point, Point] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];

    expect(getLinePercentage({ x: 0, y: 0 }, horizontalLine)).toEqual(0);
    expect(getLinePercentage({ x: 5, y: 0 }, horizontalLine)).toEqual(0.5);
    expect(getLinePercentage({ x: 10, y: 0 }, horizontalLine)).toEqual(1);

    expect(getLinePercentage({ x: -5, y: 0 }, horizontalLine)).toEqual(0);
    expect(getLinePercentage({ x: 15, y: 0 }, horizontalLine)).toEqual(1);
  });
});

describe('is point in line', () => {
  test('horizontal line', () => {
    const horizontalLine: [Point, Point] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];

    expect(isPointInLine({ x: 0, y: 0 }, horizontalLine)).toEqual(true);
    expect(isPointInLine({ x: 5, y: 0 }, horizontalLine)).toEqual(true);

    expect(isPointInLine({ x: -5, y: 0 }, horizontalLine)).toEqual(false);
    expect(isPointInLine({ x: 15, y: 0 }, horizontalLine)).toEqual(false);
  });
});
