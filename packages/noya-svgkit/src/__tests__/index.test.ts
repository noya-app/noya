import type { CanvasKit as CanvasKitType } from 'canvaskit';
import { VirtualConsole } from 'jsdom';
import loadSVGKit from '..';

let CanvasKit: CanvasKitType;
let pk: any;
let SVGKit: CanvasKitType;

const originalVirtualConsole: VirtualConsole = global._virtualConsole;

beforeAll(async () => {
  global._virtualConsole = new VirtualConsole();

  CanvasKit = await global.loadCanvasKit();
  pk = await global.loadPathKit();
  SVGKit = await loadSVGKit(pk);
});

afterAll(() => {
  global._virtualConsole = originalVirtualConsole;
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
});

export {};
