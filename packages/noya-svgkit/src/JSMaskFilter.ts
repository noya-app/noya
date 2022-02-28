import { IBlurStyle, MaskFilter } from 'canvaskit-types';
import { JSEmbindObject } from './Embind';

export class JSMaskFilter extends JSEmbindObject implements MaskFilter {
  static MakeBlur(
    style: IBlurStyle,
    sigma: number,
    respectCTM: boolean,
  ): MaskFilter {
    return new JSMaskFilter();
  }
}
