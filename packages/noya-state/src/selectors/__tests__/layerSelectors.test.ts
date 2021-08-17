import produce from 'immer';
import { debugDescription, SketchModel } from 'noya-sketch-model';

import { fixGroupFrame, resizeLayerFrame } from '../layerSelectors';

// Layer Selectors
describe('fix group frame', () => {
  test('single layer', () => {
    const group = SketchModel.group({
      layers: [
        SketchModel.rectangle({
          frame: SketchModel.rect({
            x: 100,
            y: 100,
            width: 50,
            height: 50,
          }),
        }),
      ],
    });

    const updated = produce(group, (draft) => {
      fixGroupFrame(draft);
    });

    expect(debugDescription([group, updated])).toMatchSnapshot();
  });

  test('multiple layers', () => {
    const group = SketchModel.group({
      layers: [
        SketchModel.rectangle({
          frame: SketchModel.rect({
            x: 100,
            y: 100,
            width: 50,
            height: 50,
          }),
        }),
        SketchModel.oval({
          frame: SketchModel.rect({
            x: 300,
            y: 300,
            width: 50,
            height: 50,
          }),
        }),
      ],
    });

    const updated = produce(group, (draft) => {
      fixGroupFrame(draft);
    });

    expect(debugDescription([group, updated])).toMatchSnapshot();
  });

  test('group with existing coordinates', () => {
    const group = SketchModel.group({
      frame: SketchModel.rect({
        x: -1000,
        y: -1000,
        width: 0,
        height: 0,
      }),
      layers: [
        SketchModel.rectangle({
          frame: SketchModel.rect({
            x: 100,
            y: 100,
            width: 50,
            height: 50,
          }),
        }),
      ],
    });

    const updated = produce(group, (draft) => {
      fixGroupFrame(draft);
    });

    expect(debugDescription([group, updated])).toMatchSnapshot();
  });
});

describe('updateLayerFrame', () => {
  test('resize group', () => {
    const group = SketchModel.group({
      layers: [
        SketchModel.rectangle({
          frame: SketchModel.rect({
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          }),
        }),
        SketchModel.oval({
          frame: SketchModel.rect({
            x: 100,
            y: 100,
            width: 100,
            height: 100,
          }),
        }),
      ],
    });

    fixGroupFrame(group);

    const updated = resizeLayerFrame(group, {
      x: 0,
      y: 0,
      width: 400,
      height: 400,
    });

    expect(debugDescription([group, updated])).toMatchSnapshot();
  });

  test('resize and flip group', () => {
    const group = SketchModel.group({
      layers: [
        SketchModel.rectangle({
          frame: SketchModel.rect({
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          }),
        }),
        SketchModel.oval({
          frame: SketchModel.rect({
            x: 100,
            y: 100,
            width: 100,
            height: 100,
          }),
        }),
      ],
    });

    fixGroupFrame(group);

    const updated = resizeLayerFrame(group, {
      x: -400,
      y: 0,
      width: 400,
      height: 400,
    });

    expect(debugDescription([group, updated])).toMatchSnapshot();
  });
});
