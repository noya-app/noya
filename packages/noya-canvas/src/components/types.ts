export interface ICanvasElement {
  focus(): void;
  setPointerCapture(pointerId: number): void;
  releasePointerCapture(pointerId: number): void;
}
