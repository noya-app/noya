import { Canvas, CanvasKit } from 'canvaskit-wasm';
import { ApplicationState } from 'noya-state';

export interface Context {
  state: ApplicationState;
  CanvasKit: CanvasKit;
  canvas: Canvas;
  theme: { textColor: string; backgroundColor: string };
}
