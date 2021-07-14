import Sketch from '@sketch-hq/sketch-file-format-ts';

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

export const SketchModel = {
  color,
  graphicsContextSettings,
  gradientStop,
  gradient,
  border,
};

// {
//   "_class": "fill",
//   "isEnabled": true,
//   "fillType": 0,
// "color": {
//   "_class": "color",
//   "alpha": 1,
//   "blue": 1,
//   "green": 0.5989425614936225,
//   "red": 0.5079458841463415
// },
// "contextSettings": {
//   "_class": "graphicsContextSettings",
//   "blendMode": 0,
//   "opacity": 1
// },
//   "gradient": {
//     "_class": "gradient",
//     "elipseLength": 0,
//     "from": "{0.5, 0}",
//     "gradientType": 0,
//     "to": "{0.5, 1}",
//     "stops": [
// {
//   "_class": "gradientStop",
//   "position": 0,
//   "color": {
//     "_class": "color",
//     "alpha": 1,
//     "blue": 1,
//     "green": 1,
//     "red": 1
//   }
// },
//       {
//         "_class": "gradientStop",
//         "position": 1,
//         "color": {
//           "_class": "color",
//           "alpha": 1,
//           "blue": 0,
//           "green": 0,
//           "red": 0
//         }
//       }
//     ]
//   },
//   "noiseIndex": 0,
//   "noiseIntensity": 0,
//   "patternFillType": 1,
//   "patternTileScale": 1
// }
