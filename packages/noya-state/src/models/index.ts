import type Sketch from '@sketch-hq/sketch-file-format-ts';

export const text = require('./text.json') as Sketch.Text;
export const textStyle = require('./textStyle.json') as Sketch.Style;
export const symbolMaster = require('./symbolMaster.json') as Sketch.SymbolMaster;
export const symbolInstance = require('./symbolInstance.json') as Sketch.SymbolInstance;

export { createSketchFile } from './sketchFile';
