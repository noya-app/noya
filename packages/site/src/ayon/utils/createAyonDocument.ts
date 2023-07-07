import { SketchModel } from 'noya-sketch-model';
import { createSketchFile } from 'noya-state';

const artboard = SketchModel.artboard({
  name: 'Wireframe',
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 1280,
    height: 720,
  }),
});

export function createAyonDocument() {
  const sketch = createSketchFile(SketchModel.page({ layers: [artboard] }));

  return sketch;
}
