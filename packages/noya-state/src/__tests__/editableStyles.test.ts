import Sketch from '@sketch-hq/sketch-file-format-ts';
import { SketchModel } from 'noya-sketch-model';
import {
  EditableBorder,
  EditableFill,
  EditableShadow,
  getEditableBorder,
  getEditableFill,
  getEditableShadow,
} from '../editableStyles';

const red = SketchModel.color({ red: 1 });
const blue = SketchModel.color({ blue: 1 });
const linearGradient = SketchModel.gradient();
const radialGradient = SketchModel.gradient({
  gradientType: Sketch.GradientType.Radial,
});

type ShadowProperties = Omit<Sketch.Shadow, '_class' | 'contextSettings'>;

describe('editable shadows', () => {
  const properties1: ShadowProperties = {
    isEnabled: true,
    blurRadius: 10,
    color: red,
    offsetX: 2,
    offsetY: 4,
    spread: 1,
  };

  const properties2: ShadowProperties = {
    isEnabled: false,
    blurRadius: 0,
    color: blue,
    offsetX: 0,
    offsetY: 0,
    spread: 0,
  };

  test('one shadow', () => {
    const editable = getEditableShadow([SketchModel.shadow(properties1)]);

    expect(editable).toEqual<EditableShadow>(properties1);
  });

  test('same shadow', () => {
    const editable = getEditableShadow([
      SketchModel.shadow(properties1),
      SketchModel.shadow(properties1),
    ]);

    expect(editable).toEqual<EditableShadow>(properties1);
  });

  test('different shadows', () => {
    const editable = getEditableShadow([
      SketchModel.shadow(properties1),
      SketchModel.shadow(properties2),
    ]);

    expect(editable).toEqual<EditableShadow>({
      isEnabled: true,
      blurRadius: undefined,
      color: undefined,
      offsetX: undefined,
      offsetY: undefined,
      spread: undefined,
    });
  });
});

type BorderProperties = Omit<Sketch.Border, '_class' | 'contextSettings'>;

describe('editable borders', () => {
  const properties1: BorderProperties = {
    isEnabled: true,
    color: red,
    fillType: Sketch.FillType.Color,
    position: Sketch.BorderPosition.Center,
    thickness: 2,
    gradient: linearGradient,
  };

  const properties2: BorderProperties = {
    isEnabled: false,
    color: blue,
    fillType: Sketch.FillType.Gradient,
    position: Sketch.BorderPosition.Inside,
    thickness: 0,
    gradient: radialGradient,
  };

  test('one border', () => {
    const editable = getEditableBorder([SketchModel.border(properties1)]);

    expect(editable).toEqual<EditableBorder>({
      ...properties1,
      hasMultipleFills: false,
    });
  });

  test('same border', () => {
    const editable = getEditableBorder([
      SketchModel.border(properties1),
      SketchModel.border(properties1),
    ]);

    expect(editable).toEqual<EditableBorder>({
      ...properties1,
      hasMultipleFills: false,
    });
  });

  test('different borders', () => {
    const editable = getEditableBorder([
      SketchModel.border(properties1),
      SketchModel.border(properties2),
    ]);

    expect(editable).toEqual<EditableBorder>({
      isEnabled: true,
      hasMultipleFills: true,
      color: undefined,
      fillType: undefined,
      position: undefined,
      thickness: undefined,
      gradient: properties1.gradient,
    });
  });
});

type FillProperties = Omit<Sketch.Fill, '_class'>;

describe('editable fills', () => {
  const properties1: FillProperties = {
    isEnabled: true,
    color: red,
    fillType: Sketch.FillType.Color,
    gradient: linearGradient,
    noiseIndex: 0,
    noiseIntensity: 0,
    patternFillType: Sketch.PatternFillType.Fill,
    patternTileScale: 1,
    image: undefined,
    contextSettings: SketchModel.graphicsContextSettings({ opacity: 1 }),
  };

  const properties2: FillProperties = {
    isEnabled: false,
    color: blue,
    fillType: Sketch.FillType.Gradient,
    gradient: radialGradient,
    noiseIndex: 0,
    noiseIntensity: 0,
    patternFillType: Sketch.PatternFillType.Tile,
    patternTileScale: 2,
    image: undefined,
    contextSettings: SketchModel.graphicsContextSettings({ opacity: 0 }),
  };

  test('one fill', () => {
    const editable = getEditableFill([SketchModel.fill(properties1)]);

    expect(editable).toEqual<EditableFill>({
      isEnabled: true,
      color: red,
      gradient: linearGradient,
      fillType: Sketch.FillType.Color,
      hasMultipleFills: false,
      pattern: {
        _class: 'pattern',
        patternFillType: Sketch.PatternFillType.Fill,
        patternTileScale: 1,
        image: undefined,
      },
      contextOpacity: 1,
    });
  });

  test('same fill', () => {
    const editable = getEditableFill([
      SketchModel.fill(properties1),
      SketchModel.fill(properties1),
    ]);

    expect(editable).toEqual<EditableFill>({
      isEnabled: true,
      color: red,
      gradient: linearGradient,
      fillType: Sketch.FillType.Color,
      hasMultipleFills: false,
      pattern: {
        _class: 'pattern',
        patternFillType: Sketch.PatternFillType.Fill,
        patternTileScale: 1,
        image: undefined,
      },
      contextOpacity: 1,
    });
  });

  test('different fills', () => {
    const editable = getEditableFill([
      SketchModel.fill(properties1),
      SketchModel.fill(properties2),
    ]);

    expect(editable).toEqual<EditableFill>({
      isEnabled: true,
      color: undefined,
      gradient: linearGradient,
      fillType: undefined,
      hasMultipleFills: true,
      pattern: {
        _class: 'pattern',
        patternFillType: Sketch.PatternFillType.Fill,
        patternTileScale: 1,
        image: undefined,
      },
      contextOpacity: undefined,
    });
  });
});
