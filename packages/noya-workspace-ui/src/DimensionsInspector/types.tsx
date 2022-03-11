import type { SetNumberMode } from 'noya-state';

export type DimensionValue = number | undefined;

export interface DimensionInputProps {
  id?: string;
  value: DimensionValue;
  onSetValue: (value: number, mode: SetNumberMode) => void;
  label?: string;
  size?: number;
  placeholder?: string;
  disabled?: boolean;
}

export interface DimensionsInspectorProps {
  x: DimensionValue;
  y: DimensionValue;
  width: DimensionValue;
  height: DimensionValue;
  rotation: DimensionValue;
  isFlippedVertical: boolean;
  isFlippedHorizontal: boolean;
  constrainProportions: boolean;
  supportsFlipping: boolean;
  onSetX: (value: number, mode: SetNumberMode) => void;
  onSetY: (value: number, mode: SetNumberMode) => void;
  onSetWidth: (value: number, mode: SetNumberMode) => void;
  onSetHeight: (value: number, mode: SetNumberMode) => void;
  onSetRotation: (value: number, mode: SetNumberMode) => void;
  onSetIsFlippedVertical: (value: boolean) => void;
  onSetIsFlippedHorizontal: (value: boolean) => void;
  onSetConstraintProportions: (value: boolean) => void;
}
