import { Sketch } from '@noya-app/noya-file-format';
import { Point } from '@noya-app/noya-geometry';
import { Draft } from 'immer';
import { PointString, SketchModel } from 'noya-sketch-model';
import { Layers } from '../layer';
import type { ApplicationState } from '../reducers/applicationReducer';

export type EncodedPageMetadata = {
  zoomValue: number;
  scrollOrigin: string;
};

export type PageMetadata = {
  zoomValue: number;
  scrollOrigin: Point;
};

export const getCurrentPageIndex = (state: Draft<ApplicationState>) => {
  const pageIndex = state.sketch.pages.findIndex(
    (page) => page.do_objectID === state.selectedPage,
  );

  if (pageIndex === -1) {
    throw new Error('A page must always be selected');
  }

  return pageIndex;
};

export const isSymbolsPage = (page: Pick<Sketch.Page, 'name'>) =>
  page.name === 'Symbols';

export const getSymbolsPageIndex = (state: ApplicationState) => {
  return state.sketch.pages.findIndex(isSymbolsPage);
};

export const getSymbolsPage = (state: ApplicationState) => {
  return state.sketch.pages.find(isSymbolsPage);
};

export const getCurrentPage = (state: Draft<ApplicationState>) => {
  return state.sketch.pages[getCurrentPageIndex(state)];
};

export function decodePageMetadata(meta: EncodedPageMetadata): PageMetadata {
  return {
    zoomValue: meta.zoomValue,
    scrollOrigin: PointString.decode(meta.scrollOrigin),
  };
}

export function encodePageMetadata(meta: PageMetadata): EncodedPageMetadata {
  return {
    zoomValue: meta.zoomValue,
    scrollOrigin: PointString.encode(meta.scrollOrigin),
  };
}

export const getCurrentPageMetadata = (
  state: ApplicationState,
): PageMetadata => {
  const currentPage = getCurrentPage(state);

  const meta: EncodedPageMetadata = state.sketch.user[
    currentPage.do_objectID
  ] ?? {
    zoomValue: 1,
    scrollOrigin: '{0,0}',
  };

  return decodePageMetadata(meta);
};

export const getCurrentPageZoom = (state: ApplicationState): number => {
  return getCurrentPageMetadata(state).zoomValue;
};

export const getCurrentSymbolPageIndex = (
  state: ApplicationState,
  symbolID: string,
) => {
  const pageIndex = state.sketch.pages.findIndex((page) =>
    page.layers.some(
      (l) => Layers.isSymbolMaster(l) && l.symbolID === symbolID,
    ),
  );

  return pageIndex;
};

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
