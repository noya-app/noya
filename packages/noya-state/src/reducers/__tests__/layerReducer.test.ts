import type { CanvasKit as CanvasKitType } from 'canvaskit';
import { FontManager } from 'noya-fonts';
import { GoogleFontProvider } from 'noya-google-fonts';
import { loadCanvasKit } from 'noya-renderer';
import { debugDescription, SketchModel } from 'noya-sketch-model';
import {
  createInitialState,
  createSketchFile,
  Layers,
  Selectors,
} from 'noya-state';
import {
  ApplicationReducerContext,
  ApplicationState,
} from '../applicationReducer';
import { layerReducer } from '../layerReducer';

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
  };
});

const getPageLayersLength = (state: ApplicationState) =>
  Selectors.getCurrentPage(state).layers.length;

const rectangle = SketchModel.rectangle({
  frame: SketchModel.rect({
    width: 100,
    height: 100,
  }),
});
const oval = SketchModel.oval({
  frame: SketchModel.rect({
    x: 50,
    y: 50,
    width: 100,
    height: 100,
  }),
});
const artboard = SketchModel.artboard();
const text = SketchModel.text();

describe('moveLayer', () => {
  test('move one inside', () => {
    const group = SketchModel.group();

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, group] })),
    );

    const updated = layerReducer(
      state,
      ['moveLayer', rectangle.do_objectID, group.do_objectID, 'inside'],
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('move one above', () => {
    const group = SketchModel.group();

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, group] })),
    );

    const updated = layerReducer(
      state,
      ['moveLayer', rectangle.do_objectID, group.do_objectID, 'above'],
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('move one below', () => {
    const group = SketchModel.group();

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, group] })),
    );

    const updated = layerReducer(
      state,
      ['moveLayer', group.do_objectID, rectangle.do_objectID, 'below'],
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('move already in correct place', () => {
    const group = SketchModel.group();

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, group] })),
    );

    expect(state).toEqual(
      layerReducer(
        state,
        ['moveLayer', rectangle.do_objectID, group.do_objectID, 'below'],
        context,
      ),
    );

    expect(state).toEqual(
      layerReducer(
        state,
        ['moveLayer', group.do_objectID, rectangle.do_objectID, 'above'],
        context,
      ),
    );
  });

  test('move multiple inside', () => {
    const group = SketchModel.group();

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, oval, group] })),
    );

    const updated = layerReducer(
      state,
      [
        'moveLayer',
        [rectangle.do_objectID, oval.do_objectID],
        group.do_objectID,
        'inside',
      ],
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

describe('deleteLayer', () => {
  test('delete one', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );

    expect(getPageLayersLength(state)).toEqual(1);

    const updated = layerReducer(
      state,
      ['deleteLayer', rectangle.do_objectID],
      context,
    );

    expect(getPageLayersLength(updated)).toEqual(0);
  });

  const group = SketchModel.group({ layers: [rectangle] });

  describe('delete multiple', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [group, oval] })),
    );

    test('within same parent', () => {
      const updated = layerReducer(
        state,
        ['deleteLayer', [group.do_objectID, oval.do_objectID]],
        context,
      );

      expect(
        debugDescription([
          Selectors.getCurrentPage(state),
          Selectors.getCurrentPage(updated),
        ]),
      ).toMatchSnapshot();
    });

    test('within different parents', () => {
      const updated = layerReducer(
        state,
        ['deleteLayer', [rectangle.do_objectID, oval.do_objectID]],
        context,
      );

      expect(
        debugDescription([
          Selectors.getCurrentPage(state),
          Selectors.getCurrentPage(updated),
        ]),
      ).toMatchSnapshot();
    });

    // Rectangle is a child of Group, so this should be an invalid selection
    test('bad nesting', () => {
      const updated = layerReducer(
        state,
        ['deleteLayer', [group.do_objectID, rectangle.do_objectID]],
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
});

describe('duplicateLayer', () => {
  test('duplicate one', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );

    const updated = layerReducer(
      state,
      ['duplicateLayer', [rectangle.do_objectID]],
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('duplicate multiple', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, oval] })),
    );

    const updated = layerReducer(
      state,
      ['duplicateLayer', [rectangle.do_objectID, oval.do_objectID]],
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('duplicate multiple with gap', () => {
    const state = createInitialState(
      createSketchFile(
        SketchModel.page({ layers: [rectangle, oval, artboard, text] }),
      ),
    );

    const updated = layerReducer(
      state,
      ['duplicateLayer', [rectangle.do_objectID, artboard.do_objectID]],
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('duplicate multiple in different parents', () => {
    const artboard = SketchModel.artboard({ layers: [text] });

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, artboard] })),
    );

    const updated = layerReducer(
      state,
      ['duplicateLayer', [rectangle.do_objectID, text.do_objectID]],
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

describe('grouping', () => {
  test('Group & ungroup layers', () => {
    const rectangle = SketchModel.rectangle({
      frame: SketchModel.rect({
        x: 100,
        y: 100,
        width: 100,
        height: 100,
      }),
    });

    const oval = SketchModel.oval({
      frame: SketchModel.rect({
        x: 250,
        y: 250,
        width: 100,
        height: 100,
      }),
    });

    const state = createInitialState(
      createSketchFile(
        SketchModel.page({
          layers: [
            SketchModel.rectangle({ name: 'Bottom' }),
            rectangle,
            oval,
            SketchModel.rectangle({ name: 'Top' }),
          ],
        }),
      ),
    );

    const groupedState = layerReducer(
      state,
      ['groupLayers', [rectangle.do_objectID, oval.do_objectID]],
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(groupedState),
      ]),
    ).toMatchSnapshot();

    const group = Layers.find(
      Selectors.getCurrentPage(groupedState),
      (layer) => layer._class === 'group',
    )!;

    expect(groupedState.selectedLayerIds).toEqual([group.do_objectID]);

    const ungroupedState = layerReducer(
      groupedState,
      ['ungroupLayers', [group.do_objectID]],
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(groupedState),
        Selectors.getCurrentPage(ungroupedState),
      ]),
    ).toMatchSnapshot();

    expect(ungroupedState.selectedLayerIds).toEqual([
      rectangle.do_objectID,
      oval.do_objectID,
    ]);
  });

  test('Group & ungroup nested layers', () => {
    const rectangle = SketchModel.rectangle({
      frame: SketchModel.rect({
        x: 100,
        y: 100,
        width: 100,
        height: 100,
      }),
    });

    const oval = SketchModel.oval({
      frame: SketchModel.rect({
        x: 250,
        y: 250,
        width: 100,
        height: 100,
      }),
    });

    const state = createInitialState(
      createSketchFile(
        SketchModel.page({
          layers: [
            SketchModel.artboard({
              frame: SketchModel.rect({
                x: 100,
                y: 100,
                width: 300,
                height: 300,
              }),
              layers: [
                SketchModel.rectangle({ name: 'Bottom' }),
                rectangle,
                oval,
                SketchModel.rectangle({ name: 'Top' }),
              ],
            }),
          ],
        }),
      ),
    );

    const groupedState = layerReducer(
      state,
      ['groupLayers', [rectangle.do_objectID, oval.do_objectID]],
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(groupedState),
      ]),
    ).toMatchSnapshot();

    const group = Layers.find(
      Selectors.getCurrentPage(groupedState),
      (layer) => layer._class === 'group',
    )!;

    expect(groupedState.selectedLayerIds).toEqual([group.do_objectID]);

    const ungroupedState = layerReducer(
      groupedState,
      ['ungroupLayers', [group.do_objectID]],
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(groupedState),
        Selectors.getCurrentPage(ungroupedState),
      ]),
    ).toMatchSnapshot();

    expect(ungroupedState.selectedLayerIds).toEqual([
      rectangle.do_objectID,
      oval.do_objectID,
    ]);
  });

  test('Ungroup multiple groups', () => {
    const rect1 = SketchModel.rectangle({ name: '1' });
    const rect2 = SketchModel.rectangle({ name: '2' });
    const rect3 = SketchModel.rectangle({ name: '3' });
    const rect4 = SketchModel.rectangle({ name: '4' });

    const group1 = SketchModel.group({
      layers: [rect1, rect2],
    });
    const group2 = SketchModel.group({
      layers: [rect3, rect4],
    });

    const state = createInitialState(
      createSketchFile(
        SketchModel.page({
          layers: [
            rectangle,
            group1,
            SketchModel.rectangle({ name: 'Middle' }),
            group2,
            oval,
          ],
        }),
      ),
    );

    state.selectedLayerIds = [
      rectangle.do_objectID,
      oval.do_objectID,
      group1.do_objectID,
      group2.do_objectID,
    ];

    const updated = layerReducer(
      state,
      ['ungroupLayers', state.selectedLayerIds],
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();

    expect(updated.selectedLayerIds).toEqual([
      rectangle.do_objectID,
      oval.do_objectID,
      rect1.do_objectID,
      rect2.do_objectID,
      rect3.do_objectID,
      rect4.do_objectID,
    ]);
  });
});

describe('addLayer', () => {
  test('selected layer is a group', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, oval] })),
    );

    const groupedState = layerReducer(
      state,
      ['groupLayers', [rectangle.do_objectID, oval.do_objectID]],
      context,
    );

    const updated = layerReducer(
      groupedState,
      ['addLayer', rectangle],
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(groupedState),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });
  test('original layer is in parent layer', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, oval] })),
    );

    const updated = layerReducer(state, ['addLayer', rectangle], context);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });
  test('some layer is selected', () => {
    const rectangleTwo = SketchModel.rectangle({
      frame: SketchModel.rect({
        x: 100,
        y: 100,
        width: 100,
        height: 100,
      }),
    });

    const state = createInitialState(
      createSketchFile(
        SketchModel.page({ layers: [oval, text, rectangleTwo] }),
      ),
    );

    const stateWithLayerSelected = layerReducer(
      state,
      ['selectLayer', oval.do_objectID],
      context,
    );

    const updated = layerReducer(
      stateWithLayerSelected,
      ['addLayer', rectangle],
      context,
    );

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });
  test('no layer is selected', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [oval] })),
    );

    const updated = layerReducer(state, ['addLayer', rectangle], context);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });
});
