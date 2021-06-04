import type { CanvasKitInit, FontMgr } from 'canvaskit';

const init: typeof CanvasKitInit = require('./canvaskit.js');

export { init as CanvasKitInit };
export type { FontMgr };
