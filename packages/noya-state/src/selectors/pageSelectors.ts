import * as Primitives from 'noya-renderer/src/primitives';
import { ApplicationState } from '../index';
import type { Point } from '../types';

export type EncodedPageMetadata = {
  zoomValue: number;
  scrollOrigin: string;
};

export type PageMetadata = {
  zoomValue: number;
  scrollOrigin: Point;
};

export const getCurrentPageIndex = (state: ApplicationState) => {
  const pageIndex = state.sketch.pages.findIndex(
    (page) => page.do_objectID === state.selectedPage,
  );

  if (pageIndex === -1) {
    throw new Error('A page must always be selected');
  }

  return pageIndex;
};

export const getCurrentPage = (state: ApplicationState) => {
  return state.sketch.pages[getCurrentPageIndex(state)];
};

export const getCurrentPageMetadata = (
  state: ApplicationState,
): PageMetadata => {
  const currentPage = getCurrentPage(state);

  const meta: EncodedPageMetadata = state.sketch.user[currentPage.do_objectID];

  return {
    zoomValue: meta.zoomValue,
    scrollOrigin: Primitives.parsePoint(meta.scrollOrigin),
  };
};
