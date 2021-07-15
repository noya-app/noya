import type Sketch from '@sketch-hq/sketch-file-format-ts';

export const symbolMaster = require('./symbolMaster.json') as Sketch.SymbolMaster;

export { createSketchFile } from './sketchFile';
