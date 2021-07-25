export type Point = { x: number; y: number };

export type Size = { width: number; height: number };

export type Rect = { x: number; y: number; width: number; height: number };

export type Bounds = {
  minX: number;
  midX: number;
  maxX: number;
  minY: number;
  midY: number;
  maxY: number;
};

export type Insets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type Axis = 'x' | 'y';

export type Orientation = 'horizontal' | 'vertical';
