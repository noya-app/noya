import produce from 'immer';
import { debugDescription, SketchModel } from 'noya-sketch-model';
import { fixGroupFrame } from '../layerSelectors';

describe('fix group frame', () => {
  test('single layer', () => {
    const group = SketchModel.group({
      layers: [
        SketchModel.rectangle({
          frame: SketchModel.rect({
            x: 100,
            y: 100,
            width: 50,
            height: 50,
          }),
        }),
      ],
    });

    const updated = produce(group, (draft) => {
      fixGroupFrame(draft);
    });

    expect(debugDescription([group, updated])).toMatchSnapshot();
  });

  test('multiple layers', () => {
    const group = SketchModel.group({
      layers: [
        SketchModel.rectangle({
          frame: SketchModel.rect({
            x: 100,
            y: 100,
            width: 50,
            height: 50,
          }),
        }),
        SketchModel.oval({
          frame: SketchModel.rect({
            x: 300,
            y: 300,
            width: 50,
            height: 50,
          }),
        }),
      ],
    });

    const updated = produce(group, (draft) => {
      fixGroupFrame(draft);
    });

    expect(debugDescription([group, updated])).toMatchSnapshot();
  });
});
