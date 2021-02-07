import Sketch from '@sketch-hq/sketch-file-format-ts';

export type UUID = string;

export type Point = { x: number; y: number };

export type Rect = { x: number; y: number; width: number; height: number };

export type PageLayer = Sketch.Page['layers'][0];
