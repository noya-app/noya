import { Rect } from 'noya-geometry';
import { round } from 'noya-utils';
import { resizeRect } from '../primitives';

// Ignore rounding errors in tests, for now
const roundRect = (rect: Rect): Rect => ({
  x: round(rect.x, 2),
  y: round(rect.y, 2),
  width: round(rect.width, 2),
  height: round(rect.height, 2),
});

describe('resizeRect', () => {
  describe('resize corner', () => {
    describe('not constrained', () => {
      test('resize rect se', () => {
        const rect = { x: 0, y: 0, width: 100, height: 100 };

        expect(
          roundRect(resizeRect(rect, { x: 5, y: 10 }, 'se', false)),
        ).toEqual({
          x: 0,
          y: 0,
          width: 105,
          height: 110,
        });
      });

      test('resize rect se, flip vertical', () => {
        const rect = { x: 0, y: 0, width: 100, height: 100 };

        expect(
          roundRect(resizeRect(rect, { x: 5, y: -200 }, 'se', false)),
        ).toEqual({
          x: 0,
          y: 0,
          width: 105,
          height: -100,
        });
      });

      test('resize rect se, flip horizontal', () => {
        const rect = { x: 0, y: 0, width: 100, height: 100 };

        expect(
          roundRect(resizeRect(rect, { x: -200, y: 10 }, 'se', false)),
        ).toEqual({
          x: 0,
          y: 0,
          width: -100,
          height: 110,
        });
      });
    });

    describe('constrained', () => {
      test('resize rect se', () => {
        const rect = { x: 0, y: 0, width: 100, height: 100 };

        expect(
          roundRect(resizeRect(rect, { x: 5, y: 10 }, 'se', true)),
        ).toEqual({
          x: 0,
          y: 0,
          width: 110,
          height: 110,
        });
      });

      test('resize rect se, flip vertical', () => {
        const rect = { x: 0, y: 0, width: 100, height: 100 };

        expect(
          roundRect(resizeRect(rect, { x: 5, y: -200 }, 'se', true)),
        ).toEqual({
          x: 0,
          y: 0,
          width: 105,
          height: -105,
        });
      });

      test('resize rect se, flip horizontal', () => {
        const rect = { x: 0, y: 0, width: 100, height: 100 };

        expect(
          roundRect(resizeRect(rect, { x: -200, y: 10 }, 'se', true)),
        ).toEqual({
          x: 0,
          y: 0,
          width: -110,
          height: 110,
        });
      });
    });
  });

  // test('resize rect e', () => {
  //   const rect = { x: 0, y: 0, width: 100, height: 100 };

  //   expect(roundRect(resizeRect(rect, { x: 10, y: 10 }, 'e', false))).toEqual({
  //     x: 0,
  //     y: 0,
  //     width: 110,
  //     height: 100,
  //   });
  // });
});
