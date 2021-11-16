import type { CanvasKit as CanvasKitType } from 'canvaskit';
import { FontManager } from 'noya-fonts';
import { GoogleFontProvider } from 'noya-google-fonts';
import { loadCanvasKit } from 'noya-renderer';
import { debugDescription, SketchModel } from 'noya-sketch-model';
import {
  ApplicationReducerContext,
  createInitialState,
  createSketchFile,
  Selectors,
} from 'noya-state';
import {
  createTestingFileSystem,
  createTypescriptEnvironment,
} from 'noya-typescript';
import { fixGroupFrame } from '../../selectors/layerSelectors';
import { layerPropertyReducer } from '../layerPropertyReducer';

let CanvasKit: CanvasKitType;
let context: ApplicationReducerContext;

beforeAll(async () => {
  CanvasKit = await loadCanvasKit();
  const typefaceFontProvider = CanvasKit.TypefaceFontProvider.Make();
  context = {
    canvasInsets: { top: 0, right: 0, bottom: 0, left: 0 },
    canvasSize: { width: 1000, height: 1000 },
    fontManager: {
      ...new FontManager(GoogleFontProvider),
      getTypefaceFontProvider: () => typefaceFontProvider,
    },
    typescriptEnvironment: createTypescriptEnvironment(
      await createTestingFileSystem(),
    ),
  };
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
      context,
    );

    expect(updated.sketch.pages[0].layers[0].name).toEqual('Test');
  });

  test('fails silently when renaming missing id', () => {
    const state = createInitialState(createSketchFile(SketchModel.page()));

    layerPropertyReducer(
      state,
      ['setLayerName', 'bad', 'Test'],
      CanvasKit,
      context,
    );
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
      ['setLayerWidth', 200],
      CanvasKit,
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });
});
