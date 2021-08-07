import Sketch from '@sketch-hq/sketch-file-format-ts';
import { getMultiNumberValue, getMultiValue } from 'noya-state';
import { isDeepEqual } from 'noya-utils';

export type EditableShadow = {
  // TODO: Indeterminate `isEnabled` state
  isEnabled: boolean;
  blurRadius?: number;
  color?: Sketch.Color;
  offsetX?: number;
  offsetY?: number;
  spread?: number;
};

export function getEditableShadows(shadows: Sketch.Shadow[]) {
  return {
    isEnabled: getMultiValue(shadows.map((shadow) => shadow.isEnabled)) ?? true,
    blurRadius: getMultiNumberValue(shadows.map((shadow) => shadow.blurRadius)),
    color: getMultiValue(
      shadows.map((shadow) => shadow.color),
      isDeepEqual,
    ),
    offsetX: getMultiValue(shadows.map((shadow) => shadow.offsetX)),
    offsetY: getMultiValue(shadows.map((shadow) => shadow.offsetY)),
    spread: getMultiValue(shadows.map((shadow) => shadow.spread)),
  };
}
