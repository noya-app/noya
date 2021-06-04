import { Rect } from 'canvaskit';
import useStable4ElementArray from './useStable4ElementArray';

export type RectParameters = Float32Array;

export default function useRect(parameters: RectParameters): Rect {
  return useStable4ElementArray(parameters);
}
