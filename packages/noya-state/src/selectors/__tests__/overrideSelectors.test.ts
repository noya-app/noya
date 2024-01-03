import { Sketch } from '@noya-app/noya-file-format';
import { SketchModel } from '@noya-app/noya-sketch-model';
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

describe('Mutate hierarchy', () => {
  const m1 = SketchModel.symbolMaster({
    layers: [
      SketchModel.rectangle({ name: 'A' }),
      SketchModel.rectangle({ name: 'B' }),
      SketchModel.rectangle({ name: 'C' }),
    ],
  });

  const m2 = SketchModel.symbolMaster({
    layers: [
      SketchModel.rectangle({ name: 'F' }),
      SketchModel.rectangle({ name: 'G' }),
    ],
  });

  const i1 = SketchModel.symbolInstance({
    name: 'I1',
    do_objectID: 'i1',
    symbolID: m1.symbolID,
  });

  const i2 = SketchModel.symbolInstance({
    name: 'I2',
    do_objectID: 'i2',
    symbolID: m2.symbolID,
  });

  const master = SketchModel.symbolMaster({
    layers: [
      SketchModel.rectangle({ name: 'D' }),
      i1,
      i2,
      SketchModel.rectangle({ name: 'E' }),
    ],
  });

  const instance = SketchModel.symbolInstance({
    name: 'R',
    do_objectID: 'r',
    symbolID: master.symbolID,
  });

  const state = createInitialState(
    createSketchFile(SketchModel.page({ layers: [instance, m1, m2, master] })),
  );

  const Hierarchy = createOverrideHierarchy(state);
  const diagram = (instance: Sketch.SymbolInstance) =>
    Hierarchy.diagram(instance, (l) => l.name ?? l.do_objectID);

  function describeOverrides(layer: Sketch.SymbolInstance) {
    return layer.overrideValues
      .filter((override) => override.overrideName.endsWith('layers'))
      .map((override) => {
        return [
          override.overrideName,
          (override.value as Sketch.SymbolInstance[]).map(
            (layer) => layer.name,
          ),
        ];
      });
  }

  it('tests base diagram', () => {
    expect(diagram(instance)).toMatchInlineSnapshot(`
          "R
          ├── D
          ├── I1
          │   ├── A
          │   ├── B
          │   └── C
          ├── I2
          │   ├── F
          │   └── G
          └── E"
      `);
  });

  it('moves node to root', () => {
    const updated1 = Hierarchy.move(instance, {
      indexPaths: [Hierarchy.findIndexPath(instance, (l) => l.name === 'B')!],
      to: Hierarchy.findIndexPath(instance, (l) => l.name === 'D')!,
    });

    expect(diagram(updated1)).toMatchInlineSnapshot(`
          "R
          ├── B
          ├── D
          ├── I1
          │   ├── A
          │   └── C
          ├── I2
          │   ├── F
          │   └── G
          └── E"
      `);
  });

  it('moves node within self', () => {
    const updated2 = Hierarchy.move(instance, {
      indexPaths: [Hierarchy.findIndexPath(instance, (l) => l.name === 'B')!],
      to: Hierarchy.findIndexPath(instance, (l) => l.name === 'A')!,
    });

    expect(diagram(updated2)).toMatchInlineSnapshot(`
      "R
      ├── D
      ├── I1
      │   ├── B
      │   ├── A
      │   └── C
      ├── I2
      │   ├── F
      │   └── G
      └── E"
    `);
  });

  it('moves node into sibling', () => {
    const updated3 = Hierarchy.move(instance, {
      indexPaths: [Hierarchy.findIndexPath(instance, (l) => l.name === 'B')!],
      to: Hierarchy.findIndexPath(instance, (l) => l.name === 'G')!,
    });

    expect(diagram(updated3)).toMatchInlineSnapshot(`
          "R
          ├── D
          ├── I1
          │   ├── A
          │   └── C
          ├── I2
          │   ├── F
          │   ├── B
          │   └── G
          └── E"
      `);
  });

  it('moves node back into original sibling', () => {
    const updated4 = Hierarchy.move(instance, {
      indexPaths: [Hierarchy.findIndexPath(instance, (l) => l.name === 'B')!],
      to: Hierarchy.findIndexPath(instance, (l) => l.name === 'C')!,
    });

    expect(diagram(updated4)).toMatchInlineSnapshot(`
      "R
      ├── D
      ├── I1
      │   ├── A
      │   ├── B
      │   └── C
      ├── I2
      │   ├── F
      │   └── G
      └── E"
    `);
  });

  it('tests complex usage', () => {
    expect(describeOverrides(instance)).toEqual([]);
    expect(describeOverrides(i1)).toEqual([]);
    expect(describeOverrides(i2)).toEqual([]);

    const initial = Hierarchy.insert(instance, {
      nodes: [SketchModel.rectangle({ name: 'X' })],
      at: [4],
    });

    expect(diagram(initial)).toMatchInlineSnapshot(`
      "R
      ├── D
      ├── I1
      │   ├── A
      │   ├── B
      │   └── C
      ├── I2
      │   ├── F
      │   └── G
      ├── E
      └── X"
    `);
    expect(describeOverrides(initial)).toEqual([
      ['layers', ['D', 'I1', 'I2', 'E', 'X']],
    ]);

    const intoI2 = Hierarchy.move(initial, {
      indexPaths: [Hierarchy.findIndexPath(initial, (l) => l.name === 'X')!],
      to: Hierarchy.findIndexPath(initial, (l) => l.name === 'F')!,
    });

    expect(diagram(intoI2)).toMatchInlineSnapshot(`
      "R
      ├── D
      ├── I1
      │   ├── A
      │   ├── B
      │   └── C
      ├── I2
      │   ├── X
      │   ├── F
      │   └── G
      └── E"
    `);
    expect(describeOverrides(intoI2)).toEqual([
      ['layers', ['D', 'I1', 'I2', 'E']],
      ['i2_layers', ['X', 'F', 'G']],
    ]);

    const belowG = Hierarchy.move(intoI2, {
      indexPaths: [Hierarchy.findIndexPath(intoI2, (l) => l.name === 'X')!],
      to: [2, 3],
    });

    expect(diagram(belowG)).toMatchInlineSnapshot(`
      "R
      ├── D
      ├── I1
      │   ├── A
      │   ├── B
      │   └── C
      ├── I2
      │   ├── F
      │   ├── G
      │   └── X
      └── E"
    `);
    expect(describeOverrides(belowG)).toEqual([
      ['layers', ['D', 'I1', 'I2', 'E']],
      ['i2_layers', ['F', 'G', 'X']],
    ]);
    expect(describeOverrides(i1)).toEqual([]);
    expect(describeOverrides(i2)).toEqual([]);
  });
});
