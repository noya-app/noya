import type { Sketch } from '@noya-app/noya-file-format';

const isInferredLayout = (
  groupLayout: Sketch.FreeformGroupLayout | Sketch.InferredGroupLayout,
): groupLayout is Sketch.InferredGroupLayout => {
  return groupLayout._class === 'MSImmutableInferredGroupLayout';
};

export const GroupLayouts = {
  isInferredLayout,
};
