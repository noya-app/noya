import { Skia } from '@shopify/react-native-skia';

import { IContourMeasureIter, IContourMeasure, IPath } from 'canvaskit-types';
import { JSEmbindObject } from './misc';
import PathNative from './PathNative';
import { Rect } from './types';

type SkContourMeasureIter = ReturnType<typeof Skia['ContourMeasureIter']>;
type SkContourMeasure = Exclude<ReturnType<SkContourMeasureIter['next']>, null>;

class ContourMeasureNative
  extends JSEmbindObject
  implements IContourMeasure<Rect>
{
  constructor(private _contourMeasure: SkContourMeasure) {
    super();
  }

  getPosTan(distance: number, output?: number[]): number[] {
    const skPosTan = this._contourMeasure.getPosTan(distance);
    if (output) {
      output[0] = skPosTan.px;
      output[1] = skPosTan.py;
      output[2] = skPosTan.tx;
      output[3] = skPosTan.ty;

      return output;
    }

    return [skPosTan.px, skPosTan.py, skPosTan.tx, skPosTan.ty];
  }

  getSegment(
    startD: number,
    stopD: number,
    startWithMoveTo: boolean,
  ): IPath<Rect> {
    return new PathNative(
      this._contourMeasure.getSegment(startD, stopD, startWithMoveTo),
    );
  }

  isClosed(): boolean {
    return this._contourMeasure.isClosed();
  }

  length(): number {
    return this._contourMeasure.length();
  }
}

export default class ContourMeasureIterNative
  extends JSEmbindObject
  implements IContourMeasureIter<Rect>
{
  private _contourMeasureIter: SkContourMeasureIter;

  constructor(path: IPath<Rect>, forceClosed: boolean, resScale: number) {
    super();

    this._contourMeasureIter = Skia.ContourMeasureIter(
      (path as PathNative).getRNSPath(),
      forceClosed,
      resScale,
    );
  }

  next() {
    const contourMeasure = this._contourMeasureIter.next();

    if (contourMeasure) {
      return new ContourMeasureNative(contourMeasure);
    }

    return null;
  }
}
