import { center, resize, resizeIfLarger } from '../index';

describe('center', () => {
  test('smaller', () => {
    const source = { width: 100, height: 100 };
    const destination = { width: 400, height: 200 };

    expect(center(source, destination)).toEqual({
      x: 150,
      y: 50,
      width: 100,
      height: 100,
    });
  });

  test('larger', () => {
    const source = { width: 200, height: 100 };
    const destination = { width: 100, height: 100 };

    expect(center(source, destination)).toEqual({
      x: -50,
      y: 0,
      width: 200,
      height: 100,
    });
  });

  test('same', () => {
    const source = { width: 200, height: 100 };

    expect(center(source, source)).toEqual({ x: 0, y: 0, ...source });
  });
});

describe('resize', () => {
  test('scale up', () => {
    const source = { width: 100, height: 100 };
    const destination = { width: 200, height: 200 };

    expect(resize(source, destination)).toEqual({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });
  });

  test('center horizontal', () => {
    const source = { width: 100, height: 100 };
    const destination = { width: 400, height: 200 };

    expect(resize(source, destination)).toEqual({
      x: 100,
      y: 0,
      width: 200,
      height: 200,
    });
  });

  test('center vertical', () => {
    const source = { width: 100, height: 100 };
    const destination = { width: 200, height: 400 };

    expect(resize(source, destination)).toEqual({
      x: 0,
      y: 100,
      width: 200,
      height: 200,
    });
  });

  test('scaleAspectFill', () => {
    const source = { width: 100, height: 100 };
    const destination = { width: 400, height: 200 };

    expect(resize(source, destination, 'scaleAspectFill')).toEqual({
      x: 0,
      y: -100,
      width: 400,
      height: 400,
    });
  });

  test('scaleToFill', () => {
    const source = { width: 100, height: 100 };
    const destination = { width: 400, height: 200 };

    expect(resize(source, destination, 'scaleToFill')).toEqual({
      x: 0,
      y: 0,
      width: 400,
      height: 200,
    });
  });
});

describe('resizeIfLarger', () => {
  test('no resize', () => {
    const source = { width: 100, height: 100 };
    const destination = { width: 200, height: 200 };

    expect(resizeIfLarger(source, destination)).toEqual({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    });
  });

  test('resize', () => {
    const source = { width: 400, height: 400 };
    const destination = { width: 200, height: 200 };

    expect(resizeIfLarger(source, destination)).toEqual({
      x: 0,
      y: 0,
      width: 200,
      height: 200,
    });
  });
});
