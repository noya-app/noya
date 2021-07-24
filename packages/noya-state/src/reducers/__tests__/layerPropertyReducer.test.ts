import type { CanvasKit as CanvasKitType } from 'canvaskit';
import { loadCanvasKit } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import { createInitialState, createSketchFile } from 'noya-state';
import { layerPropertyReducer } from '../layerPropertyReducer';

let CanvasKit: CanvasKitType;

beforeAll(async () => {
  CanvasKit = await loadCanvasKit();
});

const rectangle = SketchModel.rectangle();

describe('setLayerName', () => {
  test('rename one', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );

    expect(state.sketch.pages[0].layers[0].name).toEqual('Rectangle');

    const updated = layerPropertyReducer(
      state,
      ['setLayerName', rectangle.do_objectID, 'Test'],
      CanvasKit,
    );

    expect(updated.sketch.pages[0].layers[0].name).toEqual('Test');
  });
});
