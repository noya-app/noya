import type { PathEffect } from 'canvaskit';
import * as RNSkia from '@shopify/react-native-skia';

import { JSEmbindObject } from './Embind';

const SkPathEffect = RNSkia.Skia.PathEffect;

export class SkiaPathEffect extends JSEmbindObject implements PathEffect {
  _pathEffect: RNSkia.IPathEffect | null;

  constructor(pathEffect: RNSkia.IPathEffect | null) {
    super();

    this._pathEffect = pathEffect;
  }

  static MakeCorner(radius: number): PathEffect | null {
    const rnSkiaPathEffect = SkPathEffect.MakeCorner(radius);
    return new SkiaPathEffect(rnSkiaPathEffect);
  }

  static MakeDash(intervals: number[], phase?: number): PathEffect {
    const rnSkiaPathEffect = SkPathEffect.MakeDash(intervals, phase);
    return new SkiaPathEffect(rnSkiaPathEffect);
  }

  static MakeDiscrete(
    segLength: number,
    dev: number,
    seedAssist: number,
  ): PathEffect {
    const rnSkiaPathEffect = SkPathEffect.MakeDiscrete(
      segLength,
      dev,
      seedAssist,
    );
    return new SkiaPathEffect(rnSkiaPathEffect);
  }
}
