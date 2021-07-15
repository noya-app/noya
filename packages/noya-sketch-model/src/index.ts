import Sketch from '@sketch-hq/sketch-file-format-ts';
import { uuid } from 'noya-utils';

type ModelOptions<T> = Partial<Omit<T, '_class'>>;

type ModelConstructor<T> = (options?: ModelOptions<T>) => T;

// We don't {...spread} options in order to preserve property order.
// This makes colors a little nicer to read in logs/snapshots.
const color: ModelConstructor<Sketch.Color> = (options) => {
  return {
    red: options?.red ?? 0,
    green: options?.green ?? 0,
    blue: options?.blue ?? 0,
    alpha: 1,
    _class: Sketch.ClassValue.Color,
  };
};

const rect: ModelConstructor<Sketch.Rect> = (options) => {
  return {
    constrainProportions: false,
    x: options?.x ?? 0,
    y: options?.y ?? 0,
    width: options?.width ?? 0,
    height: options?.height ?? 0,
    _class: Sketch.ClassValue.Rect,
  };
};

const curvePoint: ModelConstructor<Sketch.CurvePoint> = (options) => {
  return {
    cornerRadius: 0,
    curveFrom: '{0, 0}',
    curveMode: Sketch.CurveMode.Straight,
    curveTo: '{0, 0}',
    hasCurveFrom: false,
    hasCurveTo: false,
    point: '{0, 0}',
    ...options,
    _class: Sketch.ClassValue.CurvePoint,
  };
};

const graphicsContextSettings: ModelConstructor<Sketch.GraphicsContextSettings> = (
  options,
) => {
  return {
    blendMode: Sketch.BlendMode.Normal,
    opacity: 1,
    ...options,
    _class: Sketch.ClassValue.GraphicsContextSettings,
  };
};

const gradientStop: ModelConstructor<Sketch.GradientStop> = (options) => {
  return {
    position: 0,
    color: color(),
    ...options,
    _class: Sketch.ClassValue.GradientStop,
  };
};

const gradient: ModelConstructor<Sketch.Gradient> = (options) => {
  return {
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
    _class: Sketch.ClassValue.Gradient,
  };
};

const border: ModelConstructor<Sketch.Border> = (options) => {
  return {
    isEnabled: true,
    fillType: Sketch.FillType.Color,
    color: color(),
    contextSettings: graphicsContextSettings(),
    gradient: gradient(),
    position: 1,
    thickness: 1,
    ...options,
    _class: Sketch.ClassValue.Border,
  };
};

const fill: ModelConstructor<Sketch.Fill> = (options) => {
  return {
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
    _class: Sketch.ClassValue.Fill,
  };
};

const shadow: ModelConstructor<Sketch.Shadow> = (options) => {
  return {
    isEnabled: true,
    color: color(),
    contextSettings: graphicsContextSettings(),
    blurRadius: 0,
    offsetX: 0,
    offsetY: 0,
    spread: 0,
    ...options,
    _class: Sketch.ClassValue.Shadow,
  };
};

const blur: ModelConstructor<Sketch.Blur> = (options): Sketch.Blur => {
  return {
    isEnabled: false,
    center: '{0.5, 0.5}',
    motionAngle: 0,
    radius: 10,
    saturation: 1,
    type: Sketch.BlurType.Gaussian,
    ...options,
    _class: Sketch.ClassValue.Blur,
  };
};

const borderOptions: ModelConstructor<Sketch.BorderOptions> = (
  options,
): Sketch.BorderOptions => {
  return {
    isEnabled: true,
    dashPattern: [],
    lineCapStyle: Sketch.LineCapStyle.Butt,
    lineJoinStyle: Sketch.LineJoinStyle.Miter,
    ...options,
    _class: Sketch.ClassValue.BorderOptions,
  };
};

const colorControls: ModelConstructor<Sketch.ColorControls> = (
  options,
): Sketch.ColorControls => {
  return {
    isEnabled: true,
    brightness: 0,
    contrast: 1,
    hue: 0,
    saturation: 1,
    ...options,
    _class: Sketch.ClassValue.ColorControls,
  };
};

const exportOptions: ModelConstructor<Sketch.ExportOptions> = (
  options,
): Sketch.ExportOptions => {
  return {
    includedLayerIds: [],
    layerOptions: 0,
    shouldTrim: false,
    exportFormats: [],
    ...options,
    _class: Sketch.ClassValue.ExportOptions,
  };
};

const fontDescriptor: ModelConstructor<Sketch.FontDescriptor> = (
  options,
): Sketch.FontDescriptor => {
  return {
    attributes: {
      name: 'Helvetica',
      size: 18,
    },
    ...options,
    _class: Sketch.ClassValue.FontDescriptor,
  };
};

const paragraphStyle: ModelConstructor<Sketch.ParagraphStyle> = (
  options,
): Sketch.ParagraphStyle => {
  return {
    alignment: Sketch.TextHorizontalAlignment.Left,
    ...options,
    _class: Sketch.ClassValue.ParagraphStyle,
  };
};

const encodedAttributes: ModelConstructor<
  Sketch.TextStyle['encodedAttributes']
> = (options): Sketch.TextStyle['encodedAttributes'] => {
  return {
    MSAttributedStringFontAttribute: fontDescriptor(),
    MSAttributedStringColorAttribute: color(),
    textStyleVerticalAlignmentKey: Sketch.TextVerticalAlignment.Top,
    paragraphStyle: paragraphStyle(),
    ...options,
  };
};

const textStyle: ModelConstructor<Sketch.TextStyle> = (
  options,
): Sketch.TextStyle => {
  return {
    verticalAlignment: Sketch.TextVerticalAlignment.Top,
    encodedAttributes: encodedAttributes(),
    ...options,
    _class: Sketch.ClassValue.TextStyle,
  };
};

const style: ModelConstructor<Sketch.Style> = (options): Sketch.Style => {
  return {
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
    _class: Sketch.ClassValue.Style,
  };
};

const newLayerBase = (options?: { do_objectID?: string }) => {
  return {
    do_objectID: options?.do_objectID ?? uuid(),
    booleanOperation: Sketch.BooleanOperation.None,
    isFixedToViewport: false,
    isFlippedHorizontal: false,
    isFlippedVertical: false,
    isLocked: false,
    isVisible: true,
    layerListExpandedType: Sketch.LayerListExpanded.Undecided,
    nameIsFixed: false,
    resizingConstraint: 63,
    resizingType: Sketch.ResizeType.Stretch,
    rotation: 0,
    shouldBreakMaskChain: false,
    exportOptions: exportOptions(),
    frame: rect(),
    clippingMaskMode: 0,
    hasClippingMask: false,
    edited: false,
    isClosed: true,
    pointRadiusBehaviour: Sketch.PointsRadiusBehaviour.Rounded,
  };
};

const rectangle: ModelConstructor<Sketch.Rectangle> = (
  options,
): Sketch.Rectangle => {
  return {
    ...newLayerBase(options),
    name: 'Rectangle',
    style: style(),
    points: [
      curvePoint({
        curveFrom: '{0, 0}',
        curveTo: '{0, 0}',
        point: '{0, 0}',
      }),
      curvePoint({
        curveFrom: '{1, 0}',
        curveTo: '{1, 0}',
        point: '{1, 0}',
      }),
      curvePoint({
        curveFrom: '{1, 1}',
        curveTo: '{1, 1}',
        point: '{1, 1}',
      }),
      curvePoint({
        curveFrom: '{0, 1}',
        curveTo: '{0, 1}',
        point: '{0, 1}',
      }),
    ],
    fixedRadius: 0,
    needsConvertionToNewRoundCorners: false,
    hasConvertedToNewRoundCorners: true,
    ...options,
    _class: Sketch.ClassValue.Rectangle,
  };
};

const oval: ModelConstructor<Sketch.Oval> = (options): Sketch.Oval => {
  return {
    ...newLayerBase(options),
    name: 'Oval',
    style: style(),
    points: [
      curvePoint({
        curveFrom: '{0.77614237490000004, 1}',
        curveMode: Sketch.CurveMode.Mirrored,
        curveTo: '{0.22385762510000001, 1}',
        hasCurveFrom: true,
        hasCurveTo: true,
        point: '{0.5, 1}',
      }),
      curvePoint({
        curveFrom: '{1, 0.22385762510000001}',
        curveMode: Sketch.CurveMode.Mirrored,
        curveTo: '{1, 0.77614237490000004}',
        hasCurveFrom: true,
        hasCurveTo: true,
        point: '{1, 0.5}',
      }),
      curvePoint({
        curveFrom: '{0.22385762510000001, 0}',
        curveMode: Sketch.CurveMode.Mirrored,
        curveTo: '{0.77614237490000004, 0}',
        hasCurveFrom: true,
        hasCurveTo: true,
        point: '{0.5, 0}',
      }),
      curvePoint({
        curveFrom: '{0, 0.77614237490000004}',
        curveMode: Sketch.CurveMode.Mirrored,
        curveTo: '{0, 0.22385762510000001}',
        hasCurveFrom: true,
        hasCurveTo: true,
        point: '{0, 0.5}',
      }),
    ],
    ...options,
    _class: Sketch.ClassValue.Oval,
  };
};

const shapePath: ModelConstructor<Sketch.ShapePath> = (
  options,
): Sketch.ShapePath => {
  return {
    ...newLayerBase(options),
    name: 'Path',
    style: style(),
    points: [],
    ...options,
    _class: Sketch.ClassValue.ShapePath,
  };
};

const CHECKERED_BACKGROUND = `iVBORw0KGgoAAAANSUhEUgAAABgAAAAYAQMAAADaua+7AAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABNJREFUCNdjYOD/TxL+/4GBFAwAvMsj3bQ3H74AAAAASUVORK5CYII=`;

const dataReference: ModelConstructor<Sketch.DataRef> = (
  options,
): Sketch.DataRef => {
  return {
    _ref_class: 'MSImageData',
    _ref: '',
    data: {
      _data: CHECKERED_BACKGROUND,
    },
    sha1: {
      _data: 'e17bf8d6e2e327a621e67be822bb4352949bded3',
    },
    ...options,
    _class: Sketch.ClassValue.MSJSONOriginalDataReference,
  };
};

const fileReference = (options: { _ref: string }): Sketch.FileRef => {
  return {
    _ref_class: 'MSImageData',
    _ref: options._ref,
    _class: Sketch.ClassValue.MSJSONFileReference,
  };
};

const bitmap: ModelConstructor<Sketch.Bitmap> = (options): Sketch.Bitmap => {
  return {
    ...newLayerBase(options),
    name: 'Image',
    style: style(),
    clippingMask: '{{0, 0}, {1, 1}}',
    fillReplacesImage: false,
    image: dataReference(),
    intendedDPI: 72,
    ...options,
    _class: Sketch.ClassValue.Bitmap,
  };
};

const stringAttribute: ModelConstructor<Sketch.StringAttribute> = (
  options,
): Sketch.StringAttribute => {
  return {
    location: 0,
    length: 0,
    attributes: {
      MSAttributedStringFontAttribute: fontDescriptor(),
      MSAttributedStringColorAttribute: color(),
      textStyleVerticalAlignmentKey: Sketch.TextVerticalAlignment.Top,
      paragraphStyle: paragraphStyle(),
    },
    ...options,
    _class: Sketch.ClassValue.StringAttribute,
  };
};

const attributedString: ModelConstructor<Sketch.AttributedString> = (
  options,
): Sketch.AttributedString => {
  return {
    string: '',
    attributes: [stringAttribute()],
    ...options,
    _class: Sketch.ClassValue.AttributedString,
  };
};

const text: ModelConstructor<Sketch.Text> = (options): Sketch.Text => {
  return {
    ...newLayerBase(options),
    name: 'Text',
    style: style({
      textStyle: textStyle(),
    }),
    attributedString: attributedString(),
    automaticallyDrawOnUnderlyingPath: false,
    dontSynchroniseWithSymbol: false,
    glyphBounds: '{{0, 5}, {126, 17}}',
    lineSpacingBehaviour: 3,
    textBehaviour: Sketch.TextBehaviour.Flexible,
    ...options,
    _class: Sketch.ClassValue.Text,
  };
};

const group: ModelConstructor<Sketch.Group> = (options): Sketch.Group => {
  return {
    ...newLayerBase(options),
    name: 'Group',
    style: style(),
    hasClickThrough: false,
    groupLayout: { _class: 'MSImmutableFreeformGroupLayout' },
    layers: [],
    ...options,
    _class: Sketch.ClassValue.Group,
  };
};

const rulerData: ModelConstructor<Sketch.RulerData> = (
  options,
): Sketch.RulerData => {
  return {
    base: 0,
    guides: [],
    ...options,
    _class: Sketch.ClassValue.RulerData,
  };
};

const artboard: ModelConstructor<Sketch.Artboard> = (
  options,
): Sketch.Artboard => {
  return {
    ...newLayerBase(options),
    name: 'Artboard',
    hasClickThrough: false,
    groupLayout: { _class: 'MSImmutableFreeformGroupLayout' },
    layers: [],
    hasBackgroundColor: false,
    includeBackgroundColorInExport: true,
    isFlowHome: false,
    presetDictionary: {},
    resizesContent: false,
    backgroundColor: color({ blue: 1, green: 1, red: 1 }),
    horizontalRulerData: rulerData(),
    verticalRulerData: rulerData(),
    // includeInCloudUpload: true,
    ...options,
    _class: Sketch.ClassValue.Artboard,
  };
};

const page: ModelConstructor<Sketch.Page> = (options): Sketch.Page => {
  return {
    ...newLayerBase(options),
    name: 'Page',
    hasClickThrough: false,
    groupLayout: { _class: 'MSImmutableFreeformGroupLayout' },
    layers: [],
    horizontalRulerData: rulerData(),
    verticalRulerData: rulerData(),
    // includeInCloudUpload: true,
    ...options,
    _class: Sketch.ClassValue.Page,
  };
};

const symbolInstance = (
  options: Partial<Sketch.SymbolInstance> &
    Pick<Sketch.SymbolInstance, 'symbolID'>,
): Sketch.SymbolInstance => {
  return {
    ...newLayerBase(options),
    name: 'Symbol',
    style: style(),
    horizontalSpacing: 0,
    scale: 1,
    verticalSpacing: 0,
    overrideValues: [],
    ...options,
    _class: Sketch.ClassValue.SymbolInstance,
  };
};

const inferredGroupLayout: ModelConstructor<Sketch.InferredGroupLayout> = (
  options,
): Sketch.InferredGroupLayout => {
  return {
    axis: Sketch.InferredLayoutAxis.Horizontal,
    layoutAnchor: Sketch.InferredLayoutAnchor.Middle,
    maxSize: 0,
    minSize: 0,
    ...options,
    _class: Sketch.ClassValue.MSImmutableInferredGroupLayout,
  };
};

const freeformGroupLayout = (): Sketch.FreeformGroupLayout => {
  return {
    _class: Sketch.ClassValue.MSImmutableFreeformGroupLayout,
  };
};

const symbolMaster: ModelConstructor<Sketch.SymbolMaster> = (
  options,
): Sketch.SymbolMaster => {
  return {
    ...newLayerBase(options),
    name: 'Symbol',
    style: style(),
    hasClickThrough: true,
    groupLayout: inferredGroupLayout(),
    layers: [],
    hasBackgroundColor: false,
    includeBackgroundColorInExport: false,
    isFlowHome: false,
    presetDictionary: {},
    resizesContent: false,
    backgroundColor: color({ red: 1, green: 1, blue: 1 }),
    horizontalRulerData: rulerData(),
    verticalRulerData: rulerData(),
    allowsOverrides: true,
    includeBackgroundColorInInstance: false,
    overrideProperties: [],
    symbolID: options?.symbolID ?? uuid(),
    ...options,
    _class: Sketch.ClassValue.SymbolMaster,
  };
};

export const SketchModel = {
  artboard,
  bitmap,
  border,
  borderOptions,
  color,
  colorControls,
  dataReference,
  encodedAttributes,
  fileReference,
  fill,
  fontDescriptor,
  freeformGroupLayout,
  gradient,
  gradientStop,
  graphicsContextSettings,
  group,
  inferredGroupLayout,
  oval,
  page,
  paragraphStyle,
  rect,
  rectangle,
  shadow,
  shapePath,
  style,
  symbolInstance,
  symbolMaster,
  text,
  textStyle,
};
