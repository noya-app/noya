import type Sketch from '@sketch-hq/sketch-file-format-ts';

export const fill = require('./fill.json') as Sketch.Fill;
export const border = require('./border.json') as Sketch.Border;
export const shadow = require('./shadow.json') as Sketch.Shadow;
export const oval = require('./oval.json') as Sketch.Oval;
export const artboard = require('./artboard.json') as Sketch.Artboard;
export const rectangle = require('./rectangle.json') as Sketch.Rectangle;
export const style = require('./style.json') as Sketch.Style;
export const text = require('./text.json') as Sketch.Text;
export const textStyle = require('./textStyle.json') as Sketch.Style;
export const page = require('./page.json') as Sketch.Page;
export const group = require('./group.json') as Sketch.Group;
export const symbolMaster = require('./symbolMaster.json') as Sketch.SymbolMaster;
export const symbolInstance = require('./symbolInstance.json') as Sketch.SymbolInstance;
export const shapePath = require('./shapePath.json') as Sketch.ShapePath;
export const bitmap = require('./bitmap.json') as Sketch.Bitmap;

export { createSketchFile } from './sketchFile';
