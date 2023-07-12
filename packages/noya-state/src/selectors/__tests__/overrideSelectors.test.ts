import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import {
  Layers,
  Overrides,
  createInitialState,
  createSketchFile,
} from 'noya-state';
import { applyOverrides, createOverrideHierarchy } from '../overridesSelectors';

it('Overrides text value', () => {
  const text = SketchModel.text({
    attributedString: SketchModel.attributedString({
      string: 'Hello',
    }),
  });

  const master = SketchModel.symbolMaster({
    layers: [text],
  });

  const instance = SketchModel.symbolInstance({
    symbolID: master.do_objectID,
    overrideValues: [
      SketchModel.overrideValue({
        overrideName: Overrides.encodeName([text.do_objectID], 'stringValue'),
        value: 'World',
      }),
    ],
  });

  const overridden = applyOverrides({
    overrideValues: instance.overrideValues,
    symbolMaster: master,
  });

  expect(
    Layers.find<Sketch.Text>(
      overridden,
      (l): l is Sketch.Text =>
        Layers.isTextLayer(l) && l.do_objectID === text.do_objectID,
    )?.attributedString.string,
  ).toBe('World');
});

it('Override hierarchy', () => {
  const text = SketchModel.text({
    attributedString: SketchModel.attributedString({
      string: 'Hello',
    }),
  });

  const master = SketchModel.symbolMaster({
    layers: [text],
  });

  const instance = SketchModel.symbolInstance({
    symbolID: master.symbolID,
    overrideValues: [
      SketchModel.overrideValue({
        overrideName: Overrides.encodeName([text.do_objectID], 'stringValue'),
        value: 'World',
      }),
    ],
  });

  const state = createInitialState(
    createSketchFile(SketchModel.page({ layers: [instance, master] })),
  );

  expect(
    createOverrideHierarchy(state).find<Sketch.Text>(
      instance,
      (l): l is Sketch.Text =>
        Layers.isTextLayer(l) && l.do_objectID === text.do_objectID,
    )?.attributedString.string,
  ).toBe('World');
});

it('Override hierarchy nested', () => {
  const nestedText = SketchModel.text({
    attributedString: SketchModel.attributedString({
      string: 'Hello',
    }),
  });

  const nestedMaster = SketchModel.symbolMaster({
    layers: [nestedText],
  });

  const nestedInstance = SketchModel.symbolInstance({
    symbolID: nestedMaster.symbolID,
  });

  const master = SketchModel.symbolMaster({
    layers: [nestedInstance],
  });

  const instance = SketchModel.symbolInstance({
    symbolID: master.symbolID,
    overrideValues: [
      SketchModel.overrideValue({
        overrideName: Overrides.encodeName(
          [nestedInstance.do_objectID, nestedText.do_objectID],
          'stringValue',
        ),
        value: 'World',
      }),
    ],
  });

  const state = createInitialState(
    createSketchFile(
      SketchModel.page({ layers: [instance, nestedMaster, master] }),
    ),
  );

  const hierarchy = createOverrideHierarchy(state);

  expect(
    hierarchy.find<Sketch.Text>(
      instance,
      (l): l is Sketch.Text =>
        Layers.isTextLayer(l) && l.do_objectID === nestedText.do_objectID,
    )?.attributedString.string,
  ).toBe('World');

  expect(
    hierarchy.accessPath(instance, [0, 0]).map((l) => l.do_objectID),
  ).toEqual([
    instance.do_objectID,
    nestedInstance.do_objectID,
    nestedText.do_objectID,
  ]);
});
