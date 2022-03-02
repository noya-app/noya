import { Rect } from 'canvaskit-types';
import { Rect as CKRect } from 'canvaskit';
import useStable4ElementArray from './useStable4ElementArray';

export default function useRect(parameters: Rect): Rect {
  return useStable4ElementArray(
    parameters as unknown as CKRect,
  ) as unknown as Rect;
}
