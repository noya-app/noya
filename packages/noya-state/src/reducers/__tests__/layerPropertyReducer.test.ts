import { debugDescription, SketchModel } from '@noya-app/noya-sketch-model';
import type { CanvasKit as CanvasKitType } from 'canvaskit';
import { loadCanvasKit } from 'noya-renderer';
import { createInitialState, createSketchFile, Selectors } from 'noya-state';
import { fixGroupFrame } from '../../selectors/layerSelectors';
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

  test('fails silently when renaming missing id', () => {
    const state = createInitialState(createSketchFile(SketchModel.page()));

    layerPropertyReducer(state, ['setLayerName', 'bad', 'Test'], CanvasKit);
  });
});

describe('setLayerWidth', () => {
  test('set width', () => {
    const group = SketchModel.group({
      layers: [
        SketchModel.rectangle({
          frame: SketchModel.rect({
            width: 100,
            height: 100,
          }),
        }),
      ],
    });

    fixGroupFrame(group);

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [group] })),
    );
    state.selectedLayerIds = [group.do_objectID];

    const updated = layerPropertyReducer(
      state,
      ['setLayerWidth', undefined, 200],
      CanvasKit,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });
});
