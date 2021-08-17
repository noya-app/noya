import Sketch from '@sketch-hq/sketch-file-format-ts';
import { SketchModel } from 'noya-sketch-model';
import { createInitialState } from '../../reducers/applicationReducer';
import { createSketchFile } from '../../sketchFile';
import {
  getAngularGradientCircle,
  getSelectedGradientStopPoints,
} from '../gradientSelectors';

const angularGradientStyle = SketchModel.style({
  fills: [
    SketchModel.fill({
      fillType: Sketch.FillType.Gradient,
      gradient: SketchModel.gradient({
        gradientType: Sketch.GradientType.Angular,
      }),
    }),
  ],
});

const linearGradienStyle = SketchModel.style({
  fills: [
    SketchModel.fill({
      fillType: Sketch.FillType.Gradient,
      gradient: SketchModel.gradient(),
    }),
  ],
});

// Gradient Selector
describe('set angular gradient circle', () => {
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
  test('no selected gradient', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );
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

describe('get Gradient Point', () => {
  const linearGradientRectangle = SketchModel.rectangle({
    frame: SketchModel.rect({
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    }),
    style: linearGradienStyle,
  });

  test('linear gradient / radial gradient', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [linearGradientRectangle] })),
    );

    state.selectedGradient = {
      layerId: linearGradientRectangle.do_objectID,
      fillIndex: 0,
      stopIndex: 0,
      styleType: 'fills',
    };

    expect(getSelectedGradientStopPoints(state)).toMatchSnapshot();
  });
  test('angular gradient', () => {
    const rectangle = {
      ...linearGradientRectangle,
      style: angularGradientStyle,
    };

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );

    state.selectedGradient = {
      layerId: rectangle.do_objectID,
      fillIndex: 0,
      stopIndex: 0,
      styleType: 'fills',
    };

    expect(getSelectedGradientStopPoints(state)).toMatchSnapshot();
  });
  test('sorted points', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [linearGradientRectangle] })),
    );

    state.selectedGradient = {
      layerId: linearGradienStyle.do_objectID,
      fillIndex: 0,
      stopIndex: 0,
      styleType: 'fills',
    };

    expect(getSelectedGradientStopPoints(state, true)).toMatchSnapshot();
  });
  test('no selected gradient', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [linearGradientRectangle] })),
    );

    state.selectedGradient = undefined;

    expect(getSelectedGradientStopPoints(state)).toEqual(undefined);
  });
});
