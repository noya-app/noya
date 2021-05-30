import { Draft } from 'immer';
import * as Primitives from 'noya-renderer/src/primitives';
import { ApplicationState, Layers } from '../index';
import type { Point } from '../types';

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

export const getSymbolsPageIndex = (state: ApplicationState) => {
  const pageIndex = state.sketch.pages.findIndex(
    (page) => page.name === 'Symbols',
  );

  return pageIndex;
};

export const getCurrentPage = (state: Draft<ApplicationState>) => {
  return state.sketch.pages[getCurrentPageIndex(state)];
};

export const getCurrentPageMetadata = (
  state: ApplicationState,
): PageMetadata => {
  const currentPage = getCurrentPage(state);

  const meta: EncodedPageMetadata = state.sketch.user[currentPage.do_objectID];

  return meta
    ? {
        zoomValue: meta.zoomValue,
        scrollOrigin: Primitives.parsePoint(meta.scrollOrigin),
      }
    : {
        zoomValue: 1,
        scrollOrigin: { x: 100, y: 100 },
      };
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
