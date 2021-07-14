import Sketch from '@sketch-hq/sketch-file-format-ts';
import { uuid } from 'noya-utils';

type ModelOptions<T> = Partial<Omit<T, '_class'>>;

type ModelConstructor<T> = (options?: ModelOptions<T>) => T;

const color: ModelConstructor<Sketch.Color> = (options) => {
  // We don't {...spread} options in order to preserve property order.
  // This makes colors a little nicer to read in logs/snapshots.
  return {
    _class: Sketch.ClassValue.Color,
    red: options?.red ?? 0,
    green: options?.green ?? 0,
    blue: options?.blue ?? 0,
    alpha: 1,
  };
};

const graphicsContextSettings: ModelConstructor<Sketch.GraphicsContextSettings> = (
  options,
) => {
  return {
    _class: Sketch.ClassValue.GraphicsContextSettings,
    blendMode: Sketch.BlendMode.Normal,
    opacity: 1,
    ...options,
  };
};

const gradientStop: ModelConstructor<Sketch.GradientStop> = (options) => {
  return {
    _class: Sketch.ClassValue.GradientStop,
    position: 0,
    color: color(),
    ...options,
  };
};

const gradient: ModelConstructor<Sketch.Gradient> = (options) => {
  return {
    _class: Sketch.ClassValue.Gradient,
    elipseLength: 0,
    from: '{0.5, 0}',
    gradientType: 0,
    to: '{0.5, 1}',
    stops: [
      gradientStop({
        position: 0,
        color: color({ red: 1, green: 1, blue: 1 }),
      }),
      gradientStop({
        position: 1,
        color: color({ red: 0, green: 0, blue: 0 }),
      }),
    ],
    ...options,
  };
};

const border: ModelConstructor<Sketch.Border> = (options) => {
  return {
    _class: Sketch.ClassValue.Border,
    isEnabled: true,
    fillType: Sketch.FillType.Color,
    color: color(),
    contextSettings: graphicsContextSettings(),
    gradient: gradient(),
    position: 1,
    thickness: 1,
    ...options,
  };
};

const fill: ModelConstructor<Sketch.Fill> = (options) => {
  return {
    _class: Sketch.ClassValue.Fill,
    isEnabled: true,
    fillType: Sketch.FillType.Color,
    color: color(),
    contextSettings: graphicsContextSettings(),
    gradient: gradient(),
    noiseIndex: 0,
    noiseIntensity: 0,
    patternFillType: Sketch.PatternFillType.Fill,
    patternTileScale: 1,
    ...options,
  };
};

const shadow: ModelConstructor<Sketch.Shadow> = (options) => {
  return {
    _class: Sketch.ClassValue.Shadow,
    isEnabled: true,
    color: color(),
    contextSettings: graphicsContextSettings(),
    blurRadius: 0,
    offsetX: 0,
    offsetY: 0,
    spread: 0,
    ...options,
  };
};

const blur: ModelConstructor<Sketch.Blur> = (options): Sketch.Blur => {
  return {
    _class: Sketch.ClassValue.Blur,
    isEnabled: false,
    center: '{0.5, 0.5}',
    motionAngle: 0,
    radius: 10,
    saturation: 1,
    type: Sketch.BlurType.Gaussian,
    ...options,
  };
};

const borderOptions: ModelConstructor<Sketch.BorderOptions> = (
  options,
): Sketch.BorderOptions => {
  return {
    _class: Sketch.ClassValue.BorderOptions,
    isEnabled: true,
    dashPattern: [],
    lineCapStyle: Sketch.LineCapStyle.Butt,
    lineJoinStyle: Sketch.LineJoinStyle.Miter,
    ...options,
  };
};

const colorControls: ModelConstructor<Sketch.ColorControls> = (
  options,
): Sketch.ColorControls => {
  return {
    _class: Sketch.ClassValue.ColorControls,
    isEnabled: true,
    brightness: 0,
    contrast: 1,
    hue: 0,
    saturation: 1,
    ...options,
  };
};

const style: ModelConstructor<Sketch.Style> = (options): Sketch.Style => {
  return {
    _class: Sketch.ClassValue.Style,
    do_objectID: options?.do_objectID ?? uuid(),
    endMarkerType: Sketch.MarkerType.OpenArrow,
    miterLimit: 10,
    startMarkerType: Sketch.MarkerType.OpenArrow,
    windingRule: Sketch.WindingRule.EvenOdd,
    blur: blur(),
    borderOptions: borderOptions(),
    borders: [],
    colorControls: colorControls(),
    contextSettings: graphicsContextSettings(),
    fills: [],
    innerShadows: [],
    shadows: [],
    ...options,
  };
};

export const SketchModel = {
  border,
  borderOptions,
  color,
  colorControls,
  fill,
  gradient,
  gradientStop,
  graphicsContextSettings,
  shadow,
  style,
};
