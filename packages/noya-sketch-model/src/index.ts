import Sketch from 'noya-file-format';
import { uuid } from 'noya-utils';

export { PointString } from './PointString';
export * from './debugDescription';

type ModelOptions<T> = Partial<Omit<T, '_class'>>;

// We don't {...spread} options in order to preserve property order.
// This makes colors a little nicer to read in logs/snapshots.
function color(options?: ModelOptions<Sketch.Color>): Sketch.Color {
  return {
    red: options?.red ?? 0,
    green: options?.green ?? 0,
    blue: options?.blue ?? 0,
    alpha: options?.alpha ?? 1,
    _class: Sketch.ClassValue.Color,
  };
}

function rect(options?: ModelOptions<Sketch.Rect>): Sketch.Rect {
  return {
    x: options?.x ?? 0,
    y: options?.y ?? 0,
    width: options?.width ?? 0,
    height: options?.height ?? 0,
    constrainProportions: false,
    _class: Sketch.ClassValue.Rect,
  };
}

function curvePoint(
  options?: ModelOptions<Sketch.CurvePoint>,
): Sketch.CurvePoint {
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
}

function graphicsContextSettings(
  options?: ModelOptions<Sketch.GraphicsContextSettings>,
): Sketch.GraphicsContextSettings {
  return {
    blendMode: Sketch.BlendMode.Normal,
    opacity: 1,
    ...options,
    _class: Sketch.ClassValue.GraphicsContextSettings,
  };
}

function gradientStop(
  options?: ModelOptions<Sketch.GradientStop>,
): Sketch.GradientStop {
  return {
    position: 0,
    color: color(),
    ...options,
    _class: Sketch.ClassValue.GradientStop,
  };
}

function gradient(options?: ModelOptions<Sketch.Gradient>): Sketch.Gradient {
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
}

function shaderVariable(
  options?: ModelOptions<Sketch.ShaderVariable>,
): Sketch.ShaderVariable {
  return {
    name: '',
    value: { type: 'float', data: 0 },
    ...options,
    _class: Sketch.ClassValue.ShaderVariable,
  };
}

function shader(options?: ModelOptions<Sketch.Shader>): Sketch.Shader {
  return {
    shaderString: '',
    variables: [],
    ...options,
    _class: Sketch.ClassValue.Shader,
  };
}

function border(options?: ModelOptions<Sketch.Border>): Sketch.Border {
  return {
    isEnabled: true,
    fillType: Sketch.FillType.Color,
    color: color(),
    contextSettings: graphicsContextSettings(),
    gradient: gradient(),
    position: Sketch.BorderPosition.Center,
    thickness: 1,
    ...options,
    _class: Sketch.ClassValue.Border,
  };
}

function fill(options?: ModelOptions<Sketch.Fill>): Sketch.Fill {
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
}

function shadow(options?: ModelOptions<Sketch.Shadow>): Sketch.Shadow {
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
}

function innerShadow(
  options?: ModelOptions<Sketch.InnerShadow>,
): Sketch.InnerShadow {
  return {
    isEnabled: true,
    color: color(),
    contextSettings: graphicsContextSettings(),
    blurRadius: 0,
    offsetX: 0,
    offsetY: 0,
    spread: 0,
    ...options,
    _class: Sketch.ClassValue.InnerShadow,
  };
}

function blur(options?: ModelOptions<Sketch.Blur>): Sketch.Blur {
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
}

function borderOptions(
  options?: ModelOptions<Sketch.BorderOptions>,
): Sketch.BorderOptions {
  return {
    isEnabled: true,
    dashPattern: [],
    lineCapStyle: Sketch.LineCapStyle.Butt,
    lineJoinStyle: Sketch.LineJoinStyle.Miter,
    ...options,
    _class: Sketch.ClassValue.BorderOptions,
  };
}

function colorControls(
  options?: ModelOptions<Sketch.ColorControls>,
): Sketch.ColorControls {
  return {
    isEnabled: true,
    brightness: 0,
    contrast: 1,
    hue: 0,
    saturation: 1,
    ...options,
    _class: Sketch.ClassValue.ColorControls,
  };
}

function exportFormat(
  options?: ModelOptions<Sketch.ExportFormat>,
): Sketch.ExportFormat {
  return {
    absoluteSize: 0,
    fileFormat: Sketch.ExportFileFormat.PNG,
    name: '',
    scale: 1,
    visibleScaleType: Sketch.VisibleScaleType.Scale,
    ...options,
    _class: Sketch.ClassValue.ExportFormat,
  };
}

function exportOptions(
  options?: ModelOptions<Sketch.ExportOptions>,
): Sketch.ExportOptions {
  return {
    includedLayerIds: [],
    layerOptions: 0,
    shouldTrim: false,
    exportFormats: [],
    ...options,
    _class: Sketch.ClassValue.ExportOptions,
  };
}

function fontDescriptor(
  options?: ModelOptions<Sketch.FontDescriptor>,
): Sketch.FontDescriptor {
  return {
    attributes: {
      name: 'Roboto',
      size: 18,
    },
    ...options,
    _class: Sketch.ClassValue.FontDescriptor,
  };
}

function paragraphStyle(
  options?: ModelOptions<Sketch.ParagraphStyle>,
): Sketch.ParagraphStyle {
  return {
    alignment: Sketch.TextHorizontalAlignment.Left,
    ...options,
    _class: Sketch.ClassValue.ParagraphStyle,
  };
}

function encodedAttributes(
  options?: ModelOptions<Sketch.TextStyle['encodedAttributes']>,
): Sketch.TextStyle['encodedAttributes'] {
  return {
    MSAttributedStringFontAttribute: fontDescriptor(),
    MSAttributedStringColorAttribute: color(),
    textStyleVerticalAlignmentKey: Sketch.TextVerticalAlignment.Top,
    paragraphStyle: paragraphStyle(),
    ...options,
  };
}

function textStyle(options?: ModelOptions<Sketch.TextStyle>): Sketch.TextStyle {
  return {
    verticalAlignment: Sketch.TextVerticalAlignment.Top,
    encodedAttributes: encodedAttributes(),
    ...options,
    _class: Sketch.ClassValue.TextStyle,
  };
}

function style(options?: ModelOptions<Sketch.Style>): Sketch.Style {
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
}

function newLayerBase(options?: { do_objectID?: string }) {
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
}

function rectangle(options?: ModelOptions<Sketch.Rectangle>): Sketch.Rectangle {
  return {
    ...newLayerBase(options),
    name: 'Rectangle',
    style: style(),
    points: [
      curvePoint({
        curveFrom: '{0, 0}',
        curveTo: '{0, 0}',
        point: '{0, 0}',
        cornerRadius: options?.fixedRadius ?? 0,
      }),
      curvePoint({
        curveFrom: '{1, 0}',
        curveTo: '{1, 0}',
        point: '{1, 0}',
        cornerRadius: options?.fixedRadius ?? 0,
      }),
      curvePoint({
        curveFrom: '{1, 1}',
        curveTo: '{1, 1}',
        point: '{1, 1}',
        cornerRadius: options?.fixedRadius ?? 0,
      }),
      curvePoint({
        curveFrom: '{0, 1}',
        curveTo: '{0, 1}',
        point: '{0, 1}',
        cornerRadius: options?.fixedRadius ?? 0,
      }),
    ],
    fixedRadius: 0,
    needsConvertionToNewRoundCorners: false,
    hasConvertedToNewRoundCorners: true,
    ...options,
    _class: Sketch.ClassValue.Rectangle,
  };
}

function oval(options?: ModelOptions<Sketch.Oval>): Sketch.Oval {
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
}

function shapePath(options?: ModelOptions<Sketch.ShapePath>): Sketch.ShapePath {
  return {
    ...newLayerBase(options),
    name: 'Path',
    points: [],
    style: style(),
    ...options,
    _class: Sketch.ClassValue.ShapePath,
  };
}

function shapeGroup(
  options?: ModelOptions<Sketch.ShapeGroup>,
): Sketch.ShapeGroup {
  return {
    ...newLayerBase(options),
    name: 'Path',
    style: style(),
    hasClickThrough: true,
    layers: [],
    windingRule: Sketch.WindingRule.EvenOdd,
    ...options,
    _class: Sketch.ClassValue.ShapeGroup,
  };
}

const CHECKERED_BACKGROUND = `iVBORw0KGgoAAAANSUhEUgAAABgAAAAYAQMAAADaua+7AAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABNJREFUCNdjYOD/TxL+/4GBFAwAvMsj3bQ3H74AAAAASUVORK5CYII=`;

function dataReference(options?: ModelOptions<Sketch.DataRef>): Sketch.DataRef {
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
}

function fileReference(options: Pick<Sketch.FileRef, '_ref'>): Sketch.FileRef {
  return {
    _ref_class: 'MSImageData',
    _ref: options._ref,
    _class: Sketch.ClassValue.MSJSONFileReference,
  };
}

function bitmap(options?: ModelOptions<Sketch.Bitmap>): Sketch.Bitmap {
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
}

function stringAttribute(
  options?: ModelOptions<Sketch.StringAttribute>,
): Sketch.StringAttribute {
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
}

function attributedString(
  options?: ModelOptions<Sketch.AttributedString>,
): Sketch.AttributedString {
  return {
    string: '',
    attributes: [stringAttribute()],
    ...options,
    _class: Sketch.ClassValue.AttributedString,
  };
}

function text(options?: ModelOptions<Sketch.Text>): Sketch.Text {
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
}

function group(options?: ModelOptions<Sketch.Group>): Sketch.Group {
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
}

function slice(options?: ModelOptions<Sketch.Slice>): Sketch.Slice {
  return {
    ...newLayerBase(options),
    name: 'Slice',
    style: style(),
    hasBackgroundColor: false,
    backgroundColor: color({ blue: 1, green: 1, red: 1 }),
    ...options,
    _class: Sketch.ClassValue.Slice,
  };
}

function rulerData(options?: ModelOptions<Sketch.RulerData>): Sketch.RulerData {
  return {
    base: 0,
    guides: [],
    ...options,
    _class: Sketch.ClassValue.RulerData,
  };
}

function artboard(options?: ModelOptions<Sketch.Artboard>): Sketch.Artboard {
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
}

function page(options?: ModelOptions<Sketch.Page>): Sketch.Page {
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
}

function symbolInstance(
  options: ModelOptions<Sketch.SymbolInstance> &
    Pick<Sketch.SymbolInstance, 'symbolID'>,
): Sketch.SymbolInstance {
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
}

function inferredGroupLayout(
  options?: ModelOptions<Sketch.InferredGroupLayout>,
): Sketch.InferredGroupLayout {
  return {
    axis: Sketch.InferredLayoutAxis.Horizontal,
    layoutAnchor: Sketch.InferredLayoutAnchor.Middle,
    maxSize: 0,
    minSize: 0,
    ...options,
    _class: Sketch.ClassValue.MSImmutableInferredGroupLayout,
  };
}

function freeformGroupLayout(): Sketch.FreeformGroupLayout {
  return {
    _class: Sketch.ClassValue.MSImmutableFreeformGroupLayout,
  };
}

function symbolMaster(
  options?: ModelOptions<Sketch.SymbolMaster>,
): Sketch.SymbolMaster {
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
}

function meta(options?: ModelOptions<Sketch.Meta>): Sketch.Meta {
  const app = Sketch.BundleId.PublicRelease;
  const build = 109185;
  const commit = '1cee2bd6f09ef2258eb62d151bbe50dd6c3af3f2';
  const version = 134;
  const variant = 'NONAPPSTORE';
  const appVersion = '70.4';
  const compatibilityVersion = 99;

  // We don't include `fonts` or `pagesAndArtboards` since they don't seem
  // to be necessary for Sketch to load the resulting file
  return {
    app,
    appVersion,
    autosaved: 0,
    build,
    commit,
    compatibilityVersion,
    created: {
      commit,
      appVersion,
      build,
      app,
      compatibilityVersion,
      version,
      variant,
    },
    pagesAndArtboards: {},
    saveHistory: [`${variant}.${build}`],
    variant,
    version,
    ...options,
  };
}

function createSharedObjectContainer<T extends string>(_class: T) {
  return {
    _class,
    do_objectID: uuid(),
    objects: [],
  };
}

function document(options?: ModelOptions<Sketch.Document>): Sketch.Document {
  return {
    _class: 'document',
    do_objectID: uuid(),
    documentState: { _class: 'documentState' },
    colorSpace: 0,
    currentPageIndex: 0,
    assets: {
      _class: Sketch.ClassValue.AssetCollection,
      do_objectID: uuid(),
      images: [],
      colorAssets: [],
      exportPresets: [],
      gradientAssets: [],
      imageCollection: {
        _class: Sketch.ClassValue.ImageCollection,
        images: {},
      },
      colors: [],
      gradients: [],
    },
    fontReferences: [],
    foreignLayerStyles: [],
    foreignSwatches: [],
    foreignSymbols: [],
    foreignTextStyles: [],
    layerStyles: createSharedObjectContainer(
      Sketch.ClassValue.SharedStyleContainer,
    ),
    layerTextStyles: createSharedObjectContainer(
      Sketch.ClassValue.SharedTextStyleContainer,
    ),
    sharedSwatches: createSharedObjectContainer(
      Sketch.ClassValue.SwatchContainer,
    ),
    pages: [],
    // Legacy, not used in new documents
    layerSymbols: createSharedObjectContainer(
      Sketch.ClassValue.SymbolContainer,
    ) as any,
    ...options,
  };
}

function user(options?: ModelOptions<Sketch.User>): Sketch.User {
  return {
    document: {
      pageListHeight: 0,
      pageListCollapsed: Sketch.NumericalBool.False,
    },
    ...options,
  };
}

const WHITE = color({ red: 1, green: 1, blue: 1, alpha: 1 });
const BLACK = color({ red: 0, green: 0, blue: 0, alpha: 1 });
const TRANSPARENT = color({ red: 0, green: 0, blue: 0, alpha: 0 });

export const SketchModel = {
  WHITE,
  BLACK,
  TRANSPARENT,
  artboard,
  attributedString,
  bitmap,
  blur,
  border,
  borderOptions,
  color,
  colorControls,
  curvePoint,
  dataReference,
  document,
  encodedAttributes,
  exportFormat,
  exportOptions,
  fileReference,
  fill,
  fontDescriptor,
  freeformGroupLayout,
  gradient,
  gradientStop,
  graphicsContextSettings,
  group,
  inferredGroupLayout,
  innerShadow,
  meta,
  oval,
  page,
  paragraphStyle,
  rect,
  rectangle,
  shader,
  shaderVariable,
  shadow,
  shapeGroup,
  shapePath,
  slice,
  stringAttribute,
  style,
  symbolInstance,
  symbolMaster,
  text,
  textStyle,
  user,
};
