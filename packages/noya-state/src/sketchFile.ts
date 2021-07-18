import { SketchFile } from 'noya-sketch-file';
import { SketchModel } from 'noya-sketch-model';

export function createSketchFile(): SketchFile {
  const page = SketchModel.page();

  return {
    document: SketchModel.document(),
    images: {},
    meta: SketchModel.meta(),
    pages: [page],
    user: SketchModel.user({
      [page.do_objectID]: {
        scrollOrigin: '{0, 0}',
        zoomValue: 1,
      },
    }),
  };
}
