import { BlurStyle, MaskFilter } from 'canvaskit';
import { JSEmbindObject } from './Embind';

export class JSMaskFilter extends JSEmbindObject implements MaskFilter {
  static MakeBlur(
    style: BlurStyle,
    sigma: number,
    respectCTM: boolean,
  ): MaskFilter {
    return new JSMaskFilter();
  }
}
