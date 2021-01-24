import type { CanvasKit, CanvasKitInit } from 'canvaskit-wasm';

// import type Sketch from "@sketch-hq/sketch-file-format-ts";

// import sampleRectangle from "./data/rectangle";

// interface Context {
//   CanvasKit: CanvasKit;
//   canvas: Canvas;
// }

// function ckColor({ CanvasKit }: Context, color: Sketch.Color) {
//   return CanvasKit.Color4f(color.red, color.green, color.blue, color.alpha);
// }

// function ckRect({ CanvasKit }: Context, rect: Sketch.Rect) {
//   return CanvasKit.XYWHRect(rect.x, rect.y, rect.width, rect.height);
// }

// function ckClearColor({ CanvasKit }: Context) {
//   return CanvasKit.Color4f(0, 0, 0, 0);
// }

// function renderRectangle(context: Context, rectangle: Sketch.Rectangle) {
//   const { canvas, CanvasKit } = context;

//   const bcColor = rectangle.style?.fills?.[0]?.color;
//   const paint = new CanvasKit.Paint();
//   paint.setColor(bcColor ? ckColor(context, bcColor) : ckClearColor(context));
//   paint.setStyle(CanvasKit.PaintStyle.Fill);
//   paint.setAntiAlias(true);

//   canvas.drawRect(ckRect(context, rectangle.frame), paint);
// }

const init: typeof CanvasKitInit = require('canvaskit-wasm/bin/canvaskit.js');

init({
  locateFile: (file: string) =>
    'https://unpkg.com/canvaskit-wasm@^0.22.0/bin/' + file,
}).then((CanvasKit: CanvasKit) => {
  console.log('loaded');

  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.id = 'drawing';
  document.body.appendChild(canvas);

  // CanvasKit and canvas are provided in this scope.
  const surface = CanvasKit.MakeCanvasSurface(canvas.id);
  if (!surface) {
    console.log('Could not make surface');
    return;
  }
  const context = CanvasKit.currentContext();
  const skcanvas = surface.getCanvas();

  let paint = new CanvasKit.Paint();
  paint.setAntiAlias(true);
  paint.setColor(CanvasKit.Color(0, 0, 0, 1.0));
  paint.setStyle(CanvasKit.PaintStyle.Stroke);
  paint.setStrokeWidth(4.0);
  // This effect smooths out the drawn lines a bit.
  paint.setPathEffect(CanvasKit.PathEffect.MakeCorner(50)!);

  // Draw I N K
  let path = new CanvasKit.Path();
  path.moveTo(80, 30);
  path.lineTo(80, 80);

  path.moveTo(100, 80);
  path.lineTo(100, 15);
  path.lineTo(130, 95);
  path.lineTo(130, 30);

  path.moveTo(150, 30);
  path.lineTo(150, 80);
  path.moveTo(170, 30);
  path.lineTo(150, 55);
  path.lineTo(170, 80);

  let paths = [path];
  let paints = [paint];

  function drawFrame() {
    CanvasKit.setCurrentContext(context);

    for (let i = 0; i < paints.length && i < paths.length; i++) {
      skcanvas.drawPath(paths[i], paints[i]);
    }
    // renderRectangle({ canvas: skcanvas, CanvasKit }, sampleRectangle);
    (skcanvas as any).flush();

    requestAnimationFrame(drawFrame);
  }

  let hold = false;
  canvas.addEventListener('mousemove', (e) => {
    if (!e.buttons) {
      hold = false;
      return;
    }
    if (hold) {
      path.lineTo(e.offsetX, e.offsetY);
    } else {
      paint = paint.copy();
      paint.setColor(
        CanvasKit.Color(
          Math.random() * 255,
          Math.random() * 255,
          Math.random() * 255,
          Math.random() + 0.2,
        ),
      );
      paints.push(paint);
      path = new CanvasKit.Path();
      paths.push(path);
      path.moveTo(e.offsetX, e.offsetY);
    }
    hold = true;
  });
  requestAnimationFrame(drawFrame);
});
