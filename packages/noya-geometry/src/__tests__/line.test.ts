import {
  getLinePercentage,
  getClosestPointOnLine,
  isPointInLine,
  isPointOnCircumference,
  getCirclePercentage,
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

  test('vertical line', () => {
    const verticalLine: [Point, Point] = [
      { x: 0, y: 0 },
      { x: 0, y: 10 },
    ];

    expect(getLinePercentage({ x: 0, y: 0 }, verticalLine)).toEqual(0);
    expect(getLinePercentage({ x: 0, y: 5 }, verticalLine)).toEqual(0.5);
    expect(getLinePercentage({ x: 0, y: 10 }, verticalLine)).toEqual(1);

    expect(getLinePercentage({ x: 0, y: -5 }, verticalLine)).toEqual(0);
    expect(getLinePercentage({ x: 0, y: 15 }, verticalLine)).toEqual(1);
  });

  test('diagonal line', () => {
    const diagonalLine: [Point, Point] = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];

    expect(getLinePercentage({ x: 0, y: 0 }, diagonalLine)).toEqual(0);
    expect(getLinePercentage({ x: 5, y: 5 }, diagonalLine)).toEqual(0.5);
    expect(getLinePercentage({ x: 10, y: 10 }, diagonalLine)).toEqual(1);

    expect(getLinePercentage({ x: -5, y: -5 }, diagonalLine)).toEqual(0);
    expect(getLinePercentage({ x: 15, y: 15 }, diagonalLine)).toEqual(1);
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

  test('vertical line', () => {
    const verticalLine: [Point, Point] = [
      { x: 0, y: 0 },
      { x: 0, y: 10 },
    ];

    expect(isPointInLine({ x: 0, y: 0 }, verticalLine)).toEqual(true);
    expect(isPointInLine({ x: 0, y: 5 }, verticalLine)).toEqual(true);

    expect(isPointInLine({ x: 0, y: -5 }, verticalLine)).toEqual(false);
    expect(isPointInLine({ x: 0, y: 15 }, verticalLine)).toEqual(false);
  });

  test('diagonal line', () => {
    const diagonalLine: [Point, Point] = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];

    expect(isPointInLine({ x: 0, y: 0 }, diagonalLine)).toEqual(true);
    expect(isPointInLine({ x: 5, y: 5 }, diagonalLine)).toEqual(true);

    expect(isPointInLine({ x: -5, y: -5 }, diagonalLine)).toEqual(false);
    expect(isPointInLine({ x: 15, y: 15 }, diagonalLine)).toEqual(false);
  });
});

describe('is point in circumference', () => {
  test('circumference', () => {
    const circumference = { center: { x: 0, y: 0 }, radius: 5 };

    expect(isPointOnCircumference({ x: 0, y: 5 }, circumference)).toEqual(true);
    expect(isPointOnCircumference({ x: -5, y: 0 }, circumference)).toEqual(
      true,
    );
    expect(isPointOnCircumference({ x: 0, y: -5 }, circumference)).toEqual(
      true,
    );

    expect(isPointOnCircumference({ x: 0, y: 0 }, circumference)).toEqual(
      false,
    );
    expect(isPointOnCircumference({ x: -5, y: 5 }, circumference)).toEqual(
      false,
    );
    expect(isPointOnCircumference({ x: 5, y: 5 }, circumference)).toEqual(
      false,
    );
  });
});

describe('percent on circumference', () => {
  test('circumference', () => {
    const center = { x: 5, y: 0 };

    expect(getCirclePercentage({ x: 10, y: 0 }, center)).toEqual(0);
    expect(getCirclePercentage({ x: 10, y: 0 }, center, Math.PI)).toEqual(0.5);
    expect(getCirclePercentage({ x: 5, y: 5 }, center)).toEqual(0.25);
    expect(getCirclePercentage({ x: 0, y: 0 }, center)).toEqual(0.5);
    expect(getCirclePercentage({ x: 5, y: -5 }, center)).toEqual(0.75);
  });
});
