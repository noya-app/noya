import Sketch from '@sketch-hq/sketch-file-format-ts';
import { SketchFile } from 'noya-sketch-file';
import { SketchModel } from 'noya-sketch-model';
import { createDocument } from './document';
import meta from './meta';

export function createSketchFile(): SketchFile {
  const pages = [SketchModel.page()];

  return {
    document: createDocument(),
    images: {},
    meta,
    pages,
    user: {
      document: {
        pageListHeight: 0,
        pageListCollapsed: Sketch.NumericalBool.False,
      },
      ...Object.fromEntries(
        pages.map((page) => [
          page.do_objectID,
          {
            scrollOrigin: '{0, 0}',
            zoomValue: 1,
          },
        ]),
      ),
    },
  };
}
