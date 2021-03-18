import Sketch from '@sketch-hq/sketch-file-format-ts';

export type UUID = string;

export type Point = { x: number; y: number };

export type Rect = { x: number; y: number; width: number; height: number };

export type Bounds = {
  minX: number;
  midX: number;
  maxX: number;
  minY: number;
  midY: number;
  maxY: number;
};

export type PageLayer = Sketch.Page['layers'][0];
