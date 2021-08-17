import produce from 'immer';
import { debugDescription, SketchModel } from 'noya-sketch-model';
import { createInitialState } from '../../reducers/applicationReducer';
import { createSketchFile } from '../../sketchFile';
import { getAngularGradientCircle } from '../gradientSelectors';

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

// Gradient Selector
describe('set angular gradient circle', () => {
  const angularGradientStyle = SketchModel.style({
    fills: [
      SketchModel.fill({
        gradient: SketchModel.gradient({
          gradientType: 1,
        }),
      }),
    ],
  });

  const rectangle = SketchModel.rectangle({
    frame: SketchModel.rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    }),
    style: angularGradientStyle,
  });

  test('top layer', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );
    state.selectedObjects = [rectangle.do_objectID];
    state.selectedGradient = {
      layerId: rectangle.do_objectID,
      fillIndex: 0,
      stopIndex: 0,
      styleType: 'fills',
    };

    expect(getAngularGradientCircle(state)).toEqual({
      center: { x: 50, y: 50 },
      radius: 50,
      rotation: 0,
    });
  });
  test('fliped layer', () => {
    const rotatedRectangle = { ...rectangle, isFlippedHorizontal: true };

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rotatedRectangle] })),
    );
    state.selectedObjects = [rectangle.do_objectID];
    state.selectedGradient = {
      layerId: rectangle.do_objectID,
      fillIndex: 0,
      stopIndex: 0,
      styleType: 'fills',
    };

    expect(getAngularGradientCircle(state)).toEqual({
      center: { x: 50, y: 50 },
      radius: 50,
      rotation: Math.PI.valueOf(),
    });
  });
  test('invalid layer', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );
    state.selectedObjects = [rectangle.do_objectID];
    state.selectedGradient = undefined;

    expect(getAngularGradientCircle(state)).toEqual(undefined);
  });
  test('layer in artboard', () => {
    const artboard = SketchModel.artboard({
      frame: SketchModel.rect({
        x: 450,
        y: 450,
        width: 300,
        height: 300,
      }),
      layers: [rectangle],
    });

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [artboard] })),
    );
    state.selectedObjects = [rectangle.do_objectID];
    state.selectedGradient = {
      layerId: rectangle.do_objectID,
      fillIndex: 0,
      stopIndex: 0,
      styleType: 'fills',
    };

    expect(getAngularGradientCircle(state)).toEqual({
      center: { x: 500, y: 500 },
      radius: 50,
      rotation: 0,
    });
  });
  test('layer in group in artboard', () => {
    const artboard = SketchModel.artboard({
      frame: SketchModel.rect({
        x: 450,
        y: 450,
        width: 300,
        height: 300,
      }),
      layers: [
        SketchModel.group({
          do_objectID: 'g1',
          frame: SketchModel.rect({ x: 50, y: 50, width: 100, height: 100 }),
          layers: [rectangle],
        }),
      ],
    });

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [artboard] })),
    );

    state.selectedObjects = [rectangle.do_objectID];
    state.selectedGradient = {
      layerId: rectangle.do_objectID,
      fillIndex: 0,
      stopIndex: 0,
      styleType: 'fills',
    };

    expect(getAngularGradientCircle(state)).toEqual({
      center: { x: 550, y: 550 },
      radius: 50,
      rotation: 0,
    });
  });
});
