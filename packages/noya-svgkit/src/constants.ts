import { Embind } from './Embind';

export const constants = {
  // Core Enums
  AlphaType: Embind.createEnum(['Opaque', 'Premul', 'Unpremul']),
  BlendMode: Embind.createEnum([
    'Clear',
    'Src',
    'Dst',
    'SrcOver',
    'DstOver',
    'SrcIn',
    'DstIn',
    'SrcOut',
    'DstOut',
    'SrcATop',
    'DstATop',
    'Xor',
    'Plus',
    'Modulate',
    'Screen',
    'Overlay',
    'Darken',
    'Lighten',
    'ColorDodge',
    'ColorBurn',
    'HardLight',
    'SoftLight',
    'Difference',
    'Exclusion',
    'Multiply',
    'Hue',
    'Saturation',
    'Color',
    'Luminosity',
  ]),
  BlurStyle: Embind.createEnum(['Normal', 'Solid', 'Outer', 'Inner']),
  ClipOp: Embind.createEnum(['Difference', 'Intersect']),
  ColorType: Embind.createEnum([
    'Alpha_8',
    'RGB_565',
    'RGBA_8888',
    'BGRA_8888',
    'RGBA_1010102',
    'RGB_101010x',
    'Gray_8',
    'RGBA_F16',
    'RGBA_F32',
  ]),
  FillType: Embind.createEnum(['Winding', 'EvenOdd']),
  FilterMode: Embind.createEnum(['Linear', 'Nearest']),
  FontEdging: Embind.createEnum(['Alias', 'AntiAlias', 'SubpixelAntiAlias']),
  FontHinting: Embind.createEnum(['None', 'Slight', 'Normal', 'Full']),
  GlyphRunFlags: {
    IsWhiteSpace: 1,
  },
  ImageFormat: Embind.createEnum(['PNG', 'JPEG', 'WEBP']),
  MipmapMode: Embind.createEnum(['None', 'Nearest', 'Linear']),
  PaintStyle: Embind.createEnum(['Fill', 'Stroke']),
  PathOp: Embind.createEnum([
    'Difference',
    'Intersect',
    'Union',
    'XOR',
    'ReverseDifference',
  ]),
  PointMode: Embind.createEnum(['Points', 'Lines', 'Polygon']),
  ColorSpace: 0 as any,
  // ColorSpace: class ColorSpace extends JSEmbindObject {

  //     'SRGB' = Embind .createEnumEntity(0)
  //     'DISPLAY_P3' = Embind .createEnumEntity(1)
  //     'ADOBE_RGB' = Embind.createEnumEntity(2)

  //     Equals(a, b) {
  //       return true;
  //     },
  // },
  StrokeCap: Embind.createEnum(['Butt', 'Round', 'Square']),
  StrokeJoin: Embind.createEnum(['Bevel', 'Miter', 'Round']),
  TileMode: Embind.createEnum(['Clamp', 'Decal', 'Mirror', 'Repeat']),
  VertexMode: Embind.createEnum(['Triangles', 'TrianglesStrip', 'TriangleFan']),

  // // Core Constants
  TRANSPARENT: new Float32Array([0, 0, 0, 0]),
  BLACK: new Float32Array([0, 0, 0, 1]),
  WHITE: new Float32Array([1, 1, 1, 1]),
  RED: new Float32Array([1, 0, 0, 1]),
  GREEN: new Float32Array([0, 1, 0, 1]),
  BLUE: new Float32Array([0, 0, 1, 1]),
  YELLOW: new Float32Array([1, 1, 0, 1]),
  CYAN: new Float32Array([0, 1, 1, 1]),
  MAGENTA: new Float32Array([1, 0, 1, 1]),

  MOVE_VERB: 0,
  LINE_VERB: 1,
  QUAD_VERB: 2,
  CONIC_VERB: 3,
  CUBIC_VERB: 4,
  CLOSE_VERB: 5,

  SaveLayerInitWithPrevious: 4,
  SaveLayerF16ColorType: 16,

  ShadowTransparentOccluder: 0x1,
  ShadowGeometricOnly: 0x2,
  ShadowDirectionalLight: 0x4,

  gpu: false, // true if GPU code was compiled in
  managed_skottie: false, // true if advanced (managed) Skottie code was compiled in
  particles: false, // true if Particles code was compiled in
  rt_effect: false, // true if RuntimeEffect was compiled in
  skottie: false, // true if base Skottie code was compiled in

  // Paragraph Enums
  Affinity: Embind.createEnum(['Upstream', 'Downstream']),
  DecorationStyle: Embind.createEnum([
    'Solid',
    'Double',
    'Dotted',
    'Dashed',
    'Wavy',
  ]),
  FontSlant: Embind.createEnum(['Upright', 'Italic', 'Oblique']),
  FontWeight: Embind.createEnum([
    'Invisible',
    'Thin',
    'ExtraLight',
    'Light',
    'Normal',
    'Medium',
    'SemiBold',
    'Bold',
    'ExtraBold',
    'Black',
    'ExtraBlack',
  ]),
  FontWidth: Embind.createEnum([
    'UltraCondensed',
    'ExtraCondensed',
    'Condensed',
    'SemiCondensed',
    'Normal',
    'SemiExpanded',
    'Expanded',
    'ExtraExpanded',
    'UltraExpanded',
  ]),
  PlaceholderAlignment: Embind.createEnum([
    'Baseline',
    'AboveBaseline',
    'BelowBaseline',
    'Top',
    'Bottom',
    'Middle',
  ]),
  RectHeightStyle: Embind.createEnum([
    'Tight',
    'Max',
    'IncludeLineSpacingMiddle',
    'IncludeLineSpacingTop',
    'IncludeLineSpacingBottom',
    'Strut',
  ]),
  RectWidthStyle: Embind.createEnum(['Tight', 'Max']),
  TextAlign: Embind.createEnum([
    'Left',
    'Right',
    'Center',
    'Justify',
    'Start',
    'End',
  ]),
  TextBaseline: Embind.createEnum(['Alphabetic', 'Ideographic']),
  TextDirection: Embind.createEnum(['LTR', 'RTL']),
  TextHeightBehavior: Embind.createEnum([
    'All',
    'DisableFirstAscent',
    'DisableLastDescent',
    'DisableAll',
  ]),

  // Paragraph Constants
  NoDecoration: 0x0,
  UnderlineDecoration: 0x1,
  OverlineDecoration: 0x2,
  LineThroughDecoration: 0x4,
};
