import Sketch from 'noya-file-format';
import type { RgbaColor } from '../types';

export interface Interaction {
  left: number;
  top: number;
}

export interface InteractiveProps {
  onMove: (interaction: Interaction) => void;
  onKey?: (offset: Interaction) => void;
  onClick?: (interaction: Interaction | number) => void;
  onDelete?: () => void;
  onClickPointer?: (index: number) => void;
  children: React.ReactNode;
  /**
   * [Mobile only] determines gradient control points
   */
  locations?: number[];
}

export interface PointerProps {
  top?: number;
  left: number;
  index?: number;
  selected?: boolean;
  onClick?: () => void;
}

export interface GradientProps {
  gradients: Sketch.GradientStop[];
  selectedStop: number;
  onSelectStop: (index: number) => void;
  onChangePosition: (position: number) => void;
  onAdd: (value: RgbaColor, position: number) => void;
  onDelete: () => void;
}
