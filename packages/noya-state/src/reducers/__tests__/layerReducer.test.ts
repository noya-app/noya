import { debugDescription, SketchModel } from 'noya-sketch-model';
import { createInitialState, createSketchFile, Selectors } from 'noya-state';
import { ApplicationState } from '../applicationReducer';
import { layerReducer } from '../layerReducer';

const getPageLayersLength = (state: ApplicationState) =>
  Selectors.getCurrentPage(state).layers.length;

const rectangle = SketchModel.rectangle();
const oval = SketchModel.oval();

describe('moveLayer', () => {
  test('move one inside', () => {
    const group = SketchModel.group();

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, group] })),
    );

    const updated = layerReducer(state, [
      'moveLayer',
      rectangle.do_objectID,
      group.do_objectID,
      'inside',
    ]);

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

    const updated = layerReducer(state, [
      'moveLayer',
      rectangle.do_objectID,
      group.do_objectID,
      'above',
    ]);

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

    const updated = layerReducer(state, [
      'moveLayer',
      group.do_objectID,
      rectangle.do_objectID,
      'below',
    ]);

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
      layerReducer(state, [
        'moveLayer',
        rectangle.do_objectID,
        group.do_objectID,
        'below',
      ]),
    );

    expect(state).toEqual(
      layerReducer(state, [
        'moveLayer',
        group.do_objectID,
        rectangle.do_objectID,
        'above',
      ]),
    );
  });

  test('move multiple inside', () => {
    const group = SketchModel.group();

    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [rectangle, oval, group] })),
    );

    const updated = layerReducer(state, [
      'moveLayer',
      [rectangle.do_objectID, oval.do_objectID],
      group.do_objectID,
      'inside',
    ]);

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

    const updated = layerReducer(state, ['deleteLayer', rectangle.do_objectID]);

    expect(getPageLayersLength(updated)).toEqual(0);
  });

  const group = SketchModel.group({ layers: [rectangle] });

  describe('delete multiple', () => {
    const state = createInitialState(
      createSketchFile(SketchModel.page({ layers: [group, oval] })),
    );

    test('within same parent', () => {
      const updated = layerReducer(state, [
        'deleteLayer',
        [group.do_objectID, oval.do_objectID],
      ]);

      expect(
        debugDescription(
          [Selectors.getCurrentPage(state), Selectors.getCurrentPage(updated)],
          { frames: false },
        ),
      ).toMatchSnapshot();
    });

    test('within different parents', () => {
      const updated = layerReducer(state, [
        'deleteLayer',
        [rectangle.do_objectID, oval.do_objectID],
      ]);

      expect(
        debugDescription(
          [Selectors.getCurrentPage(state), Selectors.getCurrentPage(updated)],
          { frames: false },
        ),
      ).toMatchSnapshot();
    });

    // Rectangle is a child of Group, so this should be an invalid selection
    test('bad nesting', () => {
      const updated = layerReducer(state, [
        'deleteLayer',
        [group.do_objectID, rectangle.do_objectID],
      ]);

      expect(
        debugDescription(
          [Selectors.getCurrentPage(state), Selectors.getCurrentPage(updated)],
          { frames: false },
        ),
      ).toMatchSnapshot();
    });
  });
});
