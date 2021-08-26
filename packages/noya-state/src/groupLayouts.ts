import type Sketch from 'noya-file-format';

export const isInferredLayout = (
  groupLayout: Sketch.FreeformGroupLayout | Sketch.InferredGroupLayout,
): groupLayout is Sketch.InferredGroupLayout => {
  return groupLayout._class === 'MSImmutableInferredGroupLayout';
};
