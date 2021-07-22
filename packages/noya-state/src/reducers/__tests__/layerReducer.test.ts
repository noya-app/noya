import { debugDescription, SketchModel } from 'noya-sketch-model';
import {
  createInitialWorkspaceState,
  createSketchFile,
  Selectors,
} from 'noya-state';
import { ApplicationState } from '../applicationReducer';
import { layerReducer } from '../layerReducer';

const getPageLayersLength = (state: ApplicationState) =>
  Selectors.getCurrentPage(state).layers.length;

const rectangle = SketchModel.rectangle();
const oval = SketchModel.oval();

describe('moveLayer', () => {
  test('move one inside', () => {
    const group = SketchModel.group();

    const workspaceState = createInitialWorkspaceState(
      createSketchFile(SketchModel.page({ layers: [rectangle, group] })),
    );

    const state = workspaceState.history.present;

    expect(debugDescription(Selectors.getCurrentPage(state))).toMatchSnapshot();

    const updated = layerReducer(state, [
      'moveLayer',
      rectangle.do_objectID,
      group.do_objectID,
      'inside',
    ]);

    expect(
      debugDescription(Selectors.getCurrentPage(updated)),
    ).toMatchSnapshot();
  });

  test('move multiple inside', () => {
    const group = SketchModel.group();

    const workspaceState = createInitialWorkspaceState(
      createSketchFile(SketchModel.page({ layers: [rectangle, oval, group] })),
    );

    const state = workspaceState.history.present;

    expect(debugDescription(Selectors.getCurrentPage(state))).toMatchSnapshot();

    const updated = layerReducer(state, [
      'moveLayer',
      [rectangle.do_objectID, oval.do_objectID],
      group.do_objectID,
      'inside',
    ]);

    expect(
      debugDescription(Selectors.getCurrentPage(updated)),
    ).toMatchSnapshot();
  });
});

describe('deleteLayer', () => {
  test('delete one', () => {
    const workspaceState = createInitialWorkspaceState(
      createSketchFile(SketchModel.page({ layers: [rectangle] })),
    );

    const state = workspaceState.history.present;

    expect(getPageLayersLength(state)).toEqual(1);

    const updated = layerReducer(state, ['deleteLayer', rectangle.do_objectID]);

    expect(getPageLayersLength(updated)).toEqual(0);
  });

  const group = SketchModel.group({ layers: [rectangle] });

  describe('delete multiple', () => {
    const workspaceState = createInitialWorkspaceState(
      createSketchFile(SketchModel.page({ layers: [group, oval] })),
    );

    let state = workspaceState.history.present;

    expect(
      debugDescription(Selectors.getCurrentPage(state), { frames: false }),
    ).toMatchSnapshot();

    test('within same parent', () => {
      const updated = layerReducer(state, [
        'deleteLayer',
        [group.do_objectID, oval.do_objectID],
      ]);

      expect(
        debugDescription(Selectors.getCurrentPage(updated), { frames: false }),
      ).toMatchSnapshot();
    });

    test('within different parents', () => {
      const updated = layerReducer(state, [
        'deleteLayer',
        [rectangle.do_objectID, oval.do_objectID],
      ]);

      expect(
        debugDescription(Selectors.getCurrentPage(updated), { frames: false }),
      ).toMatchSnapshot();
    });

    // Rectangle is a child of Group, so this should be an invalid selection
    test('bad nesting', () => {
      const updated = layerReducer(state, [
        'deleteLayer',
        [group.do_objectID, rectangle.do_objectID],
      ]);

      expect(
        debugDescription(Selectors.getCurrentPage(updated), { frames: false }),
      ).toMatchSnapshot();
    });
  });
});
