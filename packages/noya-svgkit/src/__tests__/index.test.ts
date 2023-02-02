import type { CanvasKit as CanvasKitType } from 'canvaskit';
import { loadCanvasKit } from 'noya-renderer';
import { loadSVGKit } from '..';

let CanvasKit: CanvasKitType;
let SVGKit: CanvasKitType;

beforeAll(async () => {
  CanvasKit = await loadCanvasKit();
  SVGKit = await loadSVGKit();
});

describe('color', () => {
  test('creates a new color object', () => {
    const s = SVGKit.Color(0, 100, 200, 0.5);
    const c = CanvasKit.Color(0, 100, 200, 0.5);

    expect(s).toEqual(c);
  });

  test('parses color', () => {
    const s = SVGKit.parseColorString('rgba(0, 100, 200, 0.5)');
    const c = CanvasKit.parseColorString('rgba(0, 100, 200, 0.5)');

    expect(s).toEqual(c);
  });
});

describe('paint', () => {
  test('creates a new paint object', () => {
    const s = new SVGKit.Paint();
    const c = new CanvasKit.Paint();

    expect(s.getStrokeWidth()).toEqual(c.getStrokeWidth());
    expect(s.getColor()).toEqual(c.getColor());
  });
});

describe('path', () => {
  test('constructor', () => {
    const s = new SVGKit.Path();
    const c = new CanvasKit.Path();

    expect(s.toCmds()).toEqual(c.toCmds());
  });

  test('lineTo', () => {
    const s = new SVGKit.Path();
    const c = new CanvasKit.Path();

    s.lineTo(10, 20);
    c.lineTo(10, 20);

    expect(s.toCmds()).toEqual(c.toCmds());
  });

  test('moveTo', () => {
    const s = new SVGKit.Path();
    const c = new CanvasKit.Path();

    s.moveTo(10, 20);
    c.moveTo(10, 20);

    expect(s.toCmds()).toEqual(c.toCmds());
  });

  test('quadTo', () => {
    const s = new SVGKit.Path();
    const c = new CanvasKit.Path();

    s.quadTo(10, 20, 15, 25);
    c.quadTo(10, 20, 15, 25);

    expect(s.toCmds()).toEqual(c.toCmds());
  });

  test('computeTightBounds', () => {
    const s = new SVGKit.Path();
    const c = new CanvasKit.Path();

    s.quadTo(10, 20, 15, 25);
    c.quadTo(10, 20, 15, 25);

    expect(s.computeTightBounds()).toEqual(c.computeTightBounds());
  });

  test('getFillType', () => {
    const s = new SVGKit.Path();
    const c = new CanvasKit.Path();

    expect(s.getFillType().value).toEqual(c.getFillType().value);
  });

  test('setFillType', () => {
    const s = new SVGKit.Path();
    const c = new CanvasKit.Path();

    s.setFillType(SVGKit.FillType.EvenOdd);
    c.setFillType(CanvasKit.FillType.EvenOdd);

    expect(s.getFillType().value).toEqual(c.getFillType().value);
  });
});
