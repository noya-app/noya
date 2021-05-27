import type Sketch from '@sketch-hq/sketch-file-format-ts';

export const isInferredLayout = (
  groupLayout: Sketch.FreeformGroupLayout | Sketch.InferredGroupLayout,
): groupLayout is Sketch.InferredGroupLayout => {
  return groupLayout._class === 'MSImmutableInferredGroupLayout';
};
