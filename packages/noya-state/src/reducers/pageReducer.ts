import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { SketchModel } from 'noya-sketch-model';
import { getIncrementedName, uuid } from 'noya-utils';
import * as Layers from '../layers';
import {
  getCurrentPage,
  getCurrentPageIndex,
  getSymbolsInstancesIndexPaths,
} from '../selectors/selectors';
import { UUID } from '../types';
import { moveArrayItem } from '../utils/moveArrayItem';
import { ApplicationState } from './applicationReducer';
import { detachSymbolIntances } from './layerReducer';

export type PageAction =
  | [type: 'movePage', sourceIndex: number, destinationIndex: number]
  | [type: 'selectPage', pageId: UUID]
  | [type: 'addPage', pageId: UUID]
  | [type: 'deletePage']
  | [type: 'renamePage', name: string]
  | [type: 'duplicatePage'];

export const createPage = (
  pages: Sketch.Page[],
  user: Sketch.User,
  pageId: string,
  name: string,
): Sketch.Page => {
  const newPage = SketchModel.page({ do_objectID: pageId, name });

  user[newPage.do_objectID] = {
    scrollOrigin: '{0, 0}',
    zoomValue: 1,
  };

  pages.push(newPage);

  return newPage;
};

export function pageReducer(
  state: ApplicationState,
  action: PageAction,
): ApplicationState {
  switch (action[0]) {
    case 'selectPage': {
      return produce(state, (draft) => {
        draft.selectedPage = action[1];
      });
    }
    case 'addPage': {
      const [, pageId] = action;

      return produce(state, (draft) => {
        const newPage = createPage(
          draft.sketch.pages,
          draft.sketch.user,
          pageId,
          getIncrementedName(
            'Page',
            state.sketch.pages.map((p) => p.name),
          ),
        );
        draft.selectedPage = newPage.do_objectID;
      });
    }
    case 'renamePage': {
      const [, name] = action;
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (draft) => {
        draft.sketch.pages[pageIndex].name = name;
      });
    }
    case 'duplicatePage': {
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (draft) => {
        const pages = draft.sketch.pages;
        const user = draft.sketch.user;
        const page = pages[pageIndex];

        const mappedSymbolIDs: Record<string, string> = {};

        page.layers.filter(Layers.isSymbolMaster).forEach((symbolMaster) => {
          mappedSymbolIDs[symbolMaster.symbolID] = uuid();
        });

        const duplicatePage = produce(page, (page) => {
          page.name = `${page.name} Copy`;

          Layers.visit(page, (layer) => {
            layer.do_objectID = uuid();
            if (layer.style) layer.style.do_objectID = uuid();

            if (
              Layers.isSymbolMaster(layer) ||
              (Layers.isSymbolInstance(layer) &&
                layer.symbolID in mappedSymbolIDs)
            ) {
              layer.symbolID = mappedSymbolIDs[layer.symbolID];
            }
          });

          return page;
        });

        user[duplicatePage.do_objectID] = {
          scrollOrigin: user[page.do_objectID].scrollOrigin,
          zoomValue: user[page.do_objectID].zoomValue,
        };

        pages.push(duplicatePage);
        draft.selectedPage = duplicatePage.do_objectID;
      });
    }
    case 'deletePage': {
      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);

      const symbolsIds = page.layers.flatMap((layer) =>
        Layers.isSymbolMaster(layer) ? [layer.symbolID] : [],
      );

      const symbolsInstancesIndexPaths = symbolsIds.flatMap((ids) =>
        getSymbolsInstancesIndexPaths(state, ids),
      );

      return produce(state, (draft) => {
        const pages = draft.sketch.pages;
        const user = draft.sketch.user;

        delete user[page.do_objectID];
        pages.splice(pageIndex, 1);

        detachSymbolIntances(pages, state, symbolsInstancesIndexPaths);

        const newIndex = Math.max(pageIndex - 1, 0);
        draft.selectedPage = pages[newIndex].do_objectID;
      });
    }
    case 'movePage': {
      const [, sourceIndex, destinationIndex] = action;

      return produce(state, (draft) => {
        moveArrayItem(draft.sketch.pages, sourceIndex, destinationIndex);
      });
    }
    default:
      return state;
  }
}
