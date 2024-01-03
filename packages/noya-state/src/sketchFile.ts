import { Sketch } from '@noya-app/noya-file-format';
import { SketchFile } from '@noya-app/noya-sketch-file';
import { SketchModel } from '@noya-app/noya-sketch-model';

export function createSketchFile(
  page: Sketch.Page = SketchModel.page(),
): SketchFile {
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
