import { Insets, Rect } from 'noya-geometry';
import { SketchModel } from 'noya-sketch-model';
import { createInitialState, createSketchFile } from 'noya-state';
import {
  getBoundingRect,
  getLayersInRect,
  LayerTraversalOptions,
} from '../geometrySelectors';

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

    const clickThroughGroupsOptions: LayerTraversalOptions = {
      clickThroughGroups: true,
    };

    expect(getBoundingRect(page, ['r1'], clickThroughGroupsOptions)).toEqual({
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    });

    expect(
      getLayersInRect(
        state,
        page,
        insets,
        marqueeRect,
        clickThroughGroupsOptions,
      ).map((layer) => layer.do_objectID),
    ).toEqual(['r1']);
  });
});

describe('layers in artboard', () => {
  test('one layer', () => {
    const page = SketchModel.page({
      layers: [
        SketchModel.artboard({
          do_objectID: 'a1',
          frame: SketchModel.rect({ x: 50, y: 50, width: 500, height: 500 }),
          layers: [r1],
        }),
      ],
    });

    const state = createInitialState(createSketchFile(page));

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

    const includeArtboardOptions: LayerTraversalOptions = {
      artboards: 'artboardOnly',
    };

    expect(getBoundingRect(page, ['a1'])).toEqual({
      x: 50,
      y: 50,
      width: 500,
      height: 500,
    });

    expect(
      getLayersInRect(
        state,
        page,
        insets,
        marqueeRect,
        includeArtboardOptions,
      ).map((layer) => layer.do_objectID),
    ).toEqual(['a1']);
  });
});
