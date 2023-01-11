import { SketchModel } from 'noya-sketch-model';
import { createSketchFile } from 'noya-state';
import {
  avatarSymbol,
  boxSymbol,
  buttonSymbol,
  checkboxSymbol,
  headingSymbol,
  iconButtonSymbol,
  imageSymbol,
  inputSymbol,
  switchSymbol,
  textSymbol,
} from './symbols';

const rectangle = SketchModel.rectangle({
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }),
  style: SketchModel.style({
    fills: [
      SketchModel.fill({
        color: SketchModel.color({ red: 1, alpha: 1 }),
      }),
    ],
  }),
});

const artboard = SketchModel.artboard({
  name: 'Wireframe',
  frame: SketchModel.rect({
    x: 0,
    y: 0,
    width: 400,
    height: 800,
  }),
  layers: [rectangle],
});

export function createAyonFile() {
  const sketch = createSketchFile(SketchModel.page({ layers: [artboard] }));

  sketch.pages.push(
    SketchModel.page({
      name: 'Symbols',
      layers: [
        buttonSymbol,
        avatarSymbol,
        boxSymbol,
        boxSymbol,
        checkboxSymbol,
        iconButtonSymbol,
        inputSymbol,
        switchSymbol,
        textSymbol,
        imageSymbol,
        headingSymbol,
      ],
    }),
  );

  return sketch;
}
