import { SketchModel } from '@noya-app/noya-sketch-model';
import { createInitialState, createSketchFile } from 'noya-state';
import { pageReducer } from '../pageReducer';

describe('setPageName', () => {
  test('rename one', () => {
    const page = SketchModel.page();
    const state = createInitialState(createSketchFile(page));

    expect(state.sketch.pages[0].name).toEqual('Page');

    const updated = pageReducer(state, [
      'setPageName',
      page.do_objectID,
      'Test',
    ]);

    expect(updated.sketch.pages[0].name).toEqual('Test');
  });

  test('fails silently when renaming missing id', () => {
    const state = createInitialState(createSketchFile(SketchModel.page()));

    pageReducer(state, ['setPageName', 'bad', 'Test']);
  });
});
