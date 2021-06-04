import type { CanvasKitInit } from 'canvaskit-wasm';

const init: typeof CanvasKitInit = require('./canvaskit.js');

export { init as CanvasKitInit };
