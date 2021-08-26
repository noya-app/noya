import Sketch from 'noya-file-format';
import { Draft } from 'immer';
import { Point } from 'noya-geometry';
import { PointString } from 'noya-sketch-model';
import { ApplicationState, Layers } from '../index';

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
