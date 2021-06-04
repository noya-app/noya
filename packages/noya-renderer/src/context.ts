import { Canvas, CanvasKit } from 'canvaskit';
import { ApplicationState } from 'noya-state';

export interface Context {
  state: ApplicationState;
  CanvasKit: CanvasKit;
  canvas: Canvas;
  canvasSize: {
    width: number;
    height: number;
  };
  theme: {
    textColor: string;
    backgroundColor: string;
  };
}
