import type { CanvasKit as CanvasKitType } from 'canvaskit';
import { FontManager } from 'noya-fonts';
import { GoogleFontProvider } from 'noya-google-fonts';
import { loadCanvasKit } from 'noya-renderer';
import { debugDescription, SketchModel } from 'noya-sketch-model';
import { createInitialState, createSketchFile, Selectors } from 'noya-state';
import {
  encodePageMetadata,
  getCurrentPageMetadata,
} from '../../selectors/pageSelectors';
import {
  Action,
  applicationReducer,
  ApplicationReducerContext,
  ApplicationState,
} from '../applicationReducer';

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

function run(state: ApplicationState, actions: Action[]) {
  return actions.reduce(
    (result, action) => applicationReducer(result, action, CanvasKit, context),
    state,
  );
}

const rectangle = SketchModel.rectangle({
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }),
});

const oval = SketchModel.oval({
  frame: SketchModel.rect({
    x: 200,
    y: 200,
    width: 100,
    height: 100,
  }),
});

describe('move', () => {
  test('move one layer', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );
    state.selectedObjects = [rectangle.do_objectID];

    const updated = run(state, [
      ['interaction', ['maybeMove', { x: 10, y: 10 }]],
      ['interaction', ['updateMoving', { x: 25, y: 25 }]],
    ]);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('move multiple layers', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, oval] })),
    );
    state.selectedObjects = [rectangle.do_objectID, oval.do_objectID];

    const updated = run(state, [
      ['interaction', ['maybeMove', { x: 10, y: 10 }]],
      ['interaction', ['updateMoving', { x: 25, y: 25 }]],
    ]);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('move with snap', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, oval] })),
    );
    state.selectedObjects = [rectangle.do_objectID];

    const mouseOriginX = 10;

    const updated = run(state, [
      ['interaction', ['maybeMove', { x: mouseOriginX, y: 10 }]],
      [
        'interaction',
        ['updateMoving', { x: oval.frame.x + mouseOriginX - 3, y: 25 }],
      ],
    ]);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('move layer in artboard', () => {
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

    const updated = run(state, [
      ['interaction', ['maybeMove', { x: 460, y: 460 }]],
      ['interaction', ['updateMoving', { x: 475, y: 475 }]],
    ]);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });
});

describe('movingPoint', () => {
  test('move one point', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );
    state.selectedObjects = [rectangle.do_objectID];

    const updated = run(state, [
      ['interaction', ['editPath']],
      ['selectPoint', [rectangle.do_objectID, 0]],
      ['interaction', ['maybeMovePoint', { x: 0, y: 0 }]],
      ['interaction', ['movingPoint', { x: 0, y: 0 }, { x: 25, y: 25 }]],
    ]);

    expect(
      debugDescription(
        [Selectors.getCurrentPage(state), Selectors.getCurrentPage(updated)],
        { points: true },
      ),
    ).toMatchSnapshot();
  });

  test('move point in artboard', () => {
    const artboard = SketchModel.artboard({
      frame: SketchModel.rect({
        x: 100,
        y: 100,
        width: 300,
        height: 300,
      }),
      layers: [rectangle],
    });

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [artboard] })),
    );

    state.selectedObjects = [rectangle.do_objectID];

    const updated = run(state, [
      ['interaction', ['editPath']],
      ['selectPoint', [rectangle.do_objectID, 0]],
      ['interaction', ['maybeMovePoint', { x: 0, y: 0 }]],
      ['interaction', ['movingPoint', { x: 0, y: 0 }, { x: 25, y: 25 }]],
    ]);

    expect(
      debugDescription(
        [Selectors.getCurrentPage(state), Selectors.getCurrentPage(updated)],
        { points: true },
      ),
    ).toMatchSnapshot();
  });
});

describe('movingControlPoint', () => {
  test('move one control point', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [oval] })),
    );
    state.selectedObjects = [oval.do_objectID];

    const updated = run(state, [
      ['interaction', ['editPath']],
      ['selectControlPoint', oval.do_objectID, 0, 'curveFrom'],
      ['interaction', ['maybeMoveControlPoint', { x: 0, y: 0 }]],
      ['interaction', ['movingControlPoint', { x: 0, y: 0 }, { x: 25, y: 25 }]],
    ]);

    expect(
      debugDescription(
        [Selectors.getCurrentPage(state), Selectors.getCurrentPage(updated)],
        { points: true },
      ),
    ).toMatchSnapshot();
  });

  test('move control point in artboard', () => {
    const artboard = SketchModel.artboard({
      frame: SketchModel.rect({
        x: 100,
        y: 100,
        width: 300,
        height: 300,
      }),
      layers: [oval],
    });

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [artboard] })),
    );

    state.selectedObjects = [oval.do_objectID];

    const updated = run(state, [
      ['interaction', ['editPath']],
      ['selectControlPoint', oval.do_objectID, 0, 'curveFrom'],
      ['interaction', ['maybeMoveControlPoint', { x: 0, y: 0 }]],
      ['interaction', ['movingControlPoint', { x: 0, y: 0 }, { x: 25, y: 25 }]],
    ]);

    expect(
      debugDescription(
        [Selectors.getCurrentPage(state), Selectors.getCurrentPage(updated)],
        { points: true },
      ),
    ).toMatchSnapshot();
  });
});

describe('scale', () => {
  test('scale one layer se', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );
    state.selectedObjects = [rectangle.do_objectID];

    const updated = run(state, [
      ['interaction', ['maybeScale', { x: 100, y: 100 }, 'se']],
      ['interaction', ['updateScaling', { x: 125, y: 125 }]],
    ]);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('scale one layer ne', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );
    state.selectedObjects = [rectangle.do_objectID];

    const updated = run(state, [
      ['interaction', ['maybeScale', { x: 100, y: 100 }, 'ne']],
      ['interaction', ['updateScaling', { x: 125, y: 125 }]],
    ]);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('scale one layer nw', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );
    state.selectedObjects = [rectangle.do_objectID];

    const updated = run(state, [
      ['interaction', ['maybeScale', { x: 100, y: 100 }, 'nw']],
      ['interaction', ['updateScaling', { x: 125, y: 125 }]],
    ]);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('scale one layer sw', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );
    state.selectedObjects = [rectangle.do_objectID];

    const updated = run(state, [
      ['interaction', ['maybeScale', { x: 100, y: 100 }, 'sw']],
      ['interaction', ['updateScaling', { x: 125, y: 125 }]],
    ]);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('scale multiple layer', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, oval] })),
    );
    state.selectedObjects = [rectangle.do_objectID, oval.do_objectID];

    const updated = run(state, [
      ['interaction', ['maybeScale', { x: 100, y: 100 }, 'se']],
      ['interaction', ['updateScaling', { x: 125, y: 125 }]],
    ]);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('scale one layer in artboard', () => {
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

    const updated = run(state, [
      ['interaction', ['maybeScale', { x: 100, y: 100 }, 'se']],
      ['interaction', ['updateScaling', { x: 125, y: 125 }]],
    ]);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('scale layers in different parents', () => {
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
      createSketchFile(SketchModel.page({ layers: [artboard, oval] })),
    );
    state.selectedObjects = [rectangle.do_objectID, oval.do_objectID];

    const updated = run(state, [
      ['interaction', ['maybeScale', { x: 100, y: 100 }, 'se']],
      ['interaction', ['updateScaling', { x: 125, y: 125 }]],
    ]);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });
});

describe('drawing', () => {
  test('draw rectangle layer', () => {
    const state = createInitialState(createSketchFile(SketchModel.page()));

    const updated = run(state, [
      ['interaction', ['startDrawing', 'rectangle', { x: 0, y: 0 }]],
      ['interaction', ['updateDrawing', { x: 100, y: 100 }]],
      ['addDrawnLayer'],
    ]);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('draw oval layer', () => {
    const state = createInitialState(createSketchFile(SketchModel.page()));

    const updated = run(state, [
      ['interaction', ['startDrawing', 'oval', { x: 0, y: 0 }]],
      ['interaction', ['updateDrawing', { x: 100, y: 100 }]],
      ['addDrawnLayer'],
    ]);

    expect(
      debugDescription([
        Selectors.getCurrentPage(state),
        Selectors.getCurrentPage(updated),
      ]),
    ).toMatchSnapshot();
  });

  test('draw line layer', () => {
    const state = createInitialState(createSketchFile(SketchModel.page()));

    const updated = run(state, [
      ['interaction', ['startDrawing', 'line', { x: 0, y: 0 }]],
      ['interaction', ['updateDrawing', { x: 100, y: 100 }]],
      ['addDrawnLayer'],
    ]);

    expect(
      debugDescription(
        [Selectors.getCurrentPage(state), Selectors.getCurrentPage(updated)],
        { points: true },
      ),
    ).toMatchSnapshot();
  });
});

describe('setZoom', () => {
  test('zoom 2x', () => {
    const state = createInitialState(createSketchFile(SketchModel.page()));

    expect(getCurrentPageMetadata(state)).toEqual({
      zoomValue: 1,
      scrollOrigin: { x: 0, y: 0 },
    });

    const updated = run(state, [['setZoom', 2, 'multiply']]);

    expect(getCurrentPageMetadata(updated)).toEqual({
      zoomValue: 2,
      scrollOrigin: { x: -500, y: -500 },
    });
  });

  test('zoom 4x', () => {
    const page = SketchModel.page();
    const state = createInitialState(createSketchFile(page));

    state.sketch.user[page.do_objectID] = encodePageMetadata({
      zoomValue: 2,
      scrollOrigin: { x: -500, y: -500 },
    });

    const updated = run(state, [['setZoom', 2, 'multiply']]);

    expect(getCurrentPageMetadata(updated)).toEqual({
      zoomValue: 4,
      scrollOrigin: { x: -1500, y: -1500 },
    });
  });

  test('zoom 0.5x', () => {
    const page = SketchModel.page();
    const state = createInitialState(createSketchFile(page));

    state.sketch.user[page.do_objectID] = encodePageMetadata({
      zoomValue: 2,
      scrollOrigin: { x: -500, y: -500 },
    });

    const updated = run(state, [['setZoom', 1 / 2, 'multiply']]);

    expect(getCurrentPageMetadata(updated)).toEqual({
      zoomValue: 1,
      scrollOrigin: { x: 0, y: 0 },
    });
  });

  test('zoom when no user metadata exists for a page', () => {
    const state = createInitialState(createSketchFile());
    const page = SketchModel.page();
    state.sketch.pages = [page];
    state.selectedPage = page.do_objectID;

    expect(state.sketch.user[page.do_objectID]).toEqual(undefined);

    const updated = run(state, [['setZoom', 2, 'multiply']]);

    expect(getCurrentPageMetadata(updated)).toEqual({
      zoomValue: 2,
      scrollOrigin: { x: -500, y: -500 },
    });
  });
});
