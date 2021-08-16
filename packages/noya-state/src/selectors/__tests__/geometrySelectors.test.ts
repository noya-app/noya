import { Insets, Rect } from 'noya-geometry';
import { SketchModel } from 'noya-sketch-model';
import { createInitialState, createSketchFile } from 'noya-state';
import { getBoundingRect, getLayersInRect } from '../geometrySelectors';

const insets: Insets = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const marqueeRect: Rect = {
  x: -1000,
  y: -1000,
  width: 2000,
  height: 2000,
};

const r1 = SketchModel.rectangle({
  do_objectID: 'r1',
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }),
});

const r2 = SketchModel.rectangle({
  do_objectID: 'r2',
  frame: SketchModel.rect({
    x: 200,
    y: 100,
    width: 100,
    height: 100,
  }),
});

const r3 = SketchModel.rectangle({
  do_objectID: 'r3',
  frame: SketchModel.rect({
    x: 10000,
    y: 10000,
    width: 100,
    height: 100,
  }),
});

describe('top level layers', () => {
  test('one layer', () => {
    const page = SketchModel.page({ layers: [r1] });

    const state = createInitialState(createSketchFile(page));

    expect(getBoundingRect(page, ['r1'])).toEqual({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });

    expect(
      getLayersInRect(state, page, insets, marqueeRect).map(
        (layer) => layer.do_objectID,
      ),
    ).toEqual(['r1']);
  });

  test('multiple layers', () => {
    const page = SketchModel.page({ layers: [r1, r2] });

    const state = createInitialState(createSketchFile(page));

    expect(getBoundingRect(page, ['r1', 'r2'])).toEqual({
      x: 0,
      y: 0,
      width: 300,
      height: 200,
    });

    expect(
      getLayersInRect(state, page, insets, marqueeRect).map(
        (layer) => layer.do_objectID,
      ),
    ).toEqual(['r2', 'r1']);
  });
});

describe('layers in group', () => {
  test('one layer', () => {
    const page = SketchModel.page({
      layers: [
        SketchModel.group({
          do_objectID: 'g1',
          frame: SketchModel.rect({ x: 50, y: 50, width: 100, height: 100 }),
          layers: [r1],
        }),
      ],
    });

    const state = createInitialState(createSketchFile(page));

    expect(getBoundingRect(page, ['r1'])).toEqual(undefined);

    expect(
      getLayersInRect(state, page, insets, marqueeRect).map(
        (layer) => layer.do_objectID,
      ),
    ).toEqual(['g1']);

    // Click through groups

    expect(
      getBoundingRect(page, ['r1'], {
        groups: 'childrenOnly',
      }),
    ).toEqual({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    });

    expect(
      getLayersInRect(state, page, insets, marqueeRect, {
        groups: 'childrenOnly',
      }).map((layer) => layer.do_objectID),
    ).toEqual(['r1']);
  });
});

describe('layers in artboard', () => {
  const page = SketchModel.page({
    layers: [
      SketchModel.artboard({
        do_objectID: 'a1',
        frame: SketchModel.rect({ x: 50, y: 50, width: 500, height: 500 }),
        layers: [r1, r3],
      }),
    ],
  });

  const state = createInitialState(createSketchFile(page));

  test('select one layer', () => {
    expect(getBoundingRect(page, ['r1'])).toEqual({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    });

    expect(
      getLayersInRect(state, page, insets, marqueeRect).map(
        (layer) => layer.do_objectID,
      ),
    ).toEqual(['r1']);
  });

  test('select artboard layer', () => {
    expect(getBoundingRect(page, ['a1'])).toEqual({
      x: 50,
      y: 50,
      width: 500,
      height: 500,
    });

    expect(
      getLayersInRect(state, page, insets, marqueeRect, {
        artboards: 'artboardOnly',
      }).map((layer) => layer.do_objectID),
    ).toEqual(['a1']);
  });

  test('select artboard layer and children', () => {
    expect(
      getLayersInRect(state, page, insets, marqueeRect, {
        artboards: 'artboardAndChildren',
      }).map((layer) => layer.do_objectID),
    ).toEqual(['a1', 'r1']);
  });

  test('select nothing outside artboard bounds', () => {
    expect(
      getLayersInRect(state, page, insets, {
        x: 10000,
        y: 10000,
        width: 1000,
        height: 1000,
      }).map((layer) => layer.do_objectID),
    ).toEqual([]);
  });
});

describe('selecting artboards', () => {
  test('select empty artboard', () => {
    const page = SketchModel.page({
      layers: [
        SketchModel.artboard({
          do_objectID: 'a1',
          frame: SketchModel.rect({ x: 50, y: 50, width: 500, height: 500 }),
        }),
      ],
    });

    const state = createInitialState(createSketchFile(page));

    expect(
      getLayersInRect(state, page, insets, marqueeRect, {
        artboards: 'emptyOrContainedArtboardAndChildren',
      }).map((layer) => layer.do_objectID),
    ).toEqual(['a1']);
  });

  test("don't select non-empty artboard", () => {
    const page = SketchModel.page({
      layers: [
        SketchModel.artboard({
          do_objectID: 'a1',
          frame: SketchModel.rect({ x: 50, y: 50, width: 500, height: 500 }),
          layers: [r3],
        }),
      ],
    });

    const state = createInitialState(createSketchFile(page));

    expect(
      getLayersInRect(
        state,
        page,
        insets,
        {
          x: 100,
          y: 100,
          width: 200,
          height: 200,
        },
        {
          artboards: 'emptyOrContainedArtboardAndChildren',
        },
      ).map((layer) => layer.do_objectID),
    ).toEqual([]);
  });

  test('select artboard fully enclosed in marquee', () => {
    const page = SketchModel.page({
      layers: [
        SketchModel.artboard({
          do_objectID: 'a1',
          frame: SketchModel.rect({ x: 50, y: 50, width: 500, height: 500 }),
          layers: [r3],
        }),
      ],
    });

    const state = createInitialState(createSketchFile(page));

    expect(
      getLayersInRect(state, page, insets, marqueeRect, {
        artboards: 'emptyOrContainedArtboardAndChildren',
      }).map((layer) => layer.do_objectID),
    ).toEqual(['a1']);
  });
});
