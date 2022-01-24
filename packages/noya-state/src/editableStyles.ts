import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import { isDeepEqual, zipLongest } from 'noya-utils';
import { decodeFontName, FontTraits } from 'noya-fonts';
import { getMultiNumberValue, getMultiValue, Selectors } from 'noya-state';
import { SimpleTextDecoration } from './primitives';

export type EditableTextStyle = {
  fontFamily?: string;
  fontTraits?: FontTraits;
  fontColor?: Sketch.Color;
  fontSize?: number;
  letterSpacing?: number;
  lineSpacing?: number;
  paragraphSpacing?: number;
  textTransform?: Sketch.TextTransform;
  textDecoration?: SimpleTextDecoration;
  verticalAlignment?: Sketch.TextVerticalAlignment;
  horizontalAlignment?: Sketch.TextHorizontalAlignment;
};

function getEditableTextStyleProperties(
  textStyle: Sketch.TextStyle,
): EditableTextStyle {
  const { fontFamily, fontTraits } = decodeFontName(
    textStyle.encodedAttributes.MSAttributedStringFontAttribute.attributes.name,
  );

  return {
    fontFamily,
    fontTraits,
    fontColor: textStyle.encodedAttributes.MSAttributedStringColorAttribute,
    fontSize:
      textStyle.encodedAttributes.MSAttributedStringFontAttribute.attributes
        .size,
    lineSpacing: textStyle.encodedAttributes.paragraphStyle?.maximumLineHeight,
    letterSpacing: textStyle.encodedAttributes.kerning,
    paragraphSpacing:
      textStyle.encodedAttributes.paragraphStyle?.paragraphSpacing,
    textTransform:
      textStyle.encodedAttributes.MSAttributedStringTextTransformAttribute,
    textDecoration: Selectors.getTextDecoration(textStyle.encodedAttributes),
    verticalAlignment:
      textStyle.encodedAttributes.textStyleVerticalAlignmentKey,
    horizontalAlignment: textStyle.encodedAttributes.paragraphStyle?.alignment,
  };
}

function getEditableStringAttributeProperties(
  attributes: Sketch.StringAttribute['attributes'],
): EditableTextStyle {
  const { fontFamily, fontTraits } = decodeFontName(
    attributes.MSAttributedStringFontAttribute.attributes.name,
  );

  return {
    fontFamily,
    fontTraits,
    fontColor: attributes.MSAttributedStringColorAttribute,
    fontSize: attributes.MSAttributedStringFontAttribute.attributes.size,
    lineSpacing: attributes.paragraphStyle?.maximumLineHeight,
    letterSpacing: attributes.kerning,
    paragraphSpacing: attributes.paragraphStyle?.paragraphSpacing,
    verticalAlignment: attributes.textStyleVerticalAlignmentKey,
    horizontalAlignment: attributes.paragraphStyle?.alignment,
  };
}

export function getEditableTextStyle(
  textStyles: Sketch.TextStyle[],
  stringAttributes: Sketch.StringAttribute['attributes'][],
): EditableTextStyle {
  const styleProperties = textStyles.map(getEditableTextStyleProperties);
  const attributeProperties = stringAttributes.map(
    getEditableStringAttributeProperties,
  );
  const properties = [...styleProperties, ...attributeProperties];

  return {
    fontFamily: getMultiValue(
      properties.map((textStyle) => textStyle.fontFamily),
    ),
    fontTraits: getMultiValue(
      properties.map((textStyle) => textStyle.fontTraits),
      isDeepEqual,
    ),
    fontColor: getMultiValue(
      properties.map((textStyle) => textStyle.fontColor),
      isDeepEqual,
    ),
    fontSize: getMultiValue(properties.map((textStyle) => textStyle.fontSize)),
    letterSpacing: getMultiValue(
      properties.map((textStyle) => textStyle.letterSpacing),
    ),
    lineSpacing: getMultiValue(
      properties.map((textStyle) => textStyle.lineSpacing),
    ),
    paragraphSpacing: getMultiValue(
      properties.map((textStyle) => textStyle.paragraphSpacing),
    ),
    textTransform: getMultiValue(
      properties.map((textStyle) => textStyle.textTransform),
    ),
    textDecoration: getMultiValue(
      properties.map((textStyle) => textStyle.textDecoration),
    ),
    verticalAlignment: getMultiValue(
      properties.map((textStyle) => textStyle.verticalAlignment),
    ),
    horizontalAlignment: getMultiValue(
      properties.map((textStyle) => textStyle.horizontalAlignment),
    ),
  };
}

export type EditableShadow = {
  // TODO: Indeterminate `isEnabled` state
  isEnabled: boolean;
  blurRadius?: number;
  color?: Sketch.Color;
  offsetX?: number;
  offsetY?: number;
  spread?: number;
};

export function getEditableShadow(
  shadows: (Sketch.Shadow | Sketch.InnerShadow)[],
): EditableShadow {
  return {
    isEnabled: getMultiValue(shadows.map((shadow) => shadow.isEnabled)) ?? true,
    blurRadius: getMultiNumberValue(shadows.map((shadow) => shadow.blurRadius)),
    color: getMultiValue(
      shadows.map((shadow) => shadow.color),
      isDeepEqual,
    ),
    offsetX: getMultiValue(shadows.map((shadow) => shadow.offsetX)),
    offsetY: getMultiValue(shadows.map((shadow) => shadow.offsetY)),
    spread: getMultiValue(shadows.map((shadow) => shadow.spread)),
  };
}

export type EditableBorder = {
  // TODO: Indeterminate `isEnabled` state
  isEnabled: boolean;
  hasMultipleFills: boolean;
  color?: Sketch.Color;
  fillType?: Sketch.FillType;
  position?: Sketch.BorderPosition;
  thickness?: number;
  gradient: Sketch.Gradient;
};

export function getEditableBorder(borders: Sketch.Border[]): EditableBorder {
  const fillType = getMultiValue(
    borders.map((border) => border.fillType),
    isDeepEqual,
  );

  const gradient = getMultiValue(
    borders.map((border) => border.gradient),
    isDeepEqual,
  );

  return {
    isEnabled: getMultiValue(borders.map((border) => border.isEnabled)) ?? true,
    hasMultipleFills:
      fillType === undefined ||
      (fillType === Sketch.FillType.Gradient && !gradient),
    color: getMultiValue(
      borders.map((border) => border.color),
      isDeepEqual,
    ),
    fillType,
    position: getMultiValue(
      borders.map((border) => border.position),
      isDeepEqual,
    ),
    thickness: getMultiNumberValue(borders.map((border) => border.thickness)),
    gradient: gradient ?? borders[0].gradient,
  };
}

export type EditableFill = {
  // TODO: Indeterminate `isEnabled` state
  isEnabled: boolean;
  hasMultipleFills: boolean;
  color?: Sketch.Color;
  fillType?: Sketch.FillType;
  contextOpacity?: number;
  gradient: Sketch.Gradient;
  pattern: Sketch.Pattern;
  shader: Sketch.Shader;
};

export function getEditableFill(fills: Sketch.Fill[]): EditableFill {
  const fillType = getMultiValue(
    fills.map((fill) => fill.fillType),
    isDeepEqual,
  );

  const gradient = getMultiValue(
    fills.map((fill) => fill.gradient),
    isDeepEqual,
  );

  const getPattern = (fill: Sketch.Fill): Sketch.Pattern => ({
    _class: 'pattern',
    patternFillType: fill.patternFillType,
    patternTileScale: fill.patternTileScale,
    image: fill.image,
  });

  const patterns = fills.map(getPattern);

  return {
    isEnabled: getMultiValue(fills.map((fill) => fill.isEnabled)) ?? true,
    hasMultipleFills:
      fillType === undefined ||
      (fillType === Sketch.FillType.Gradient && !gradient),
    color: getMultiValue(
      fills.map((fill) => fill.color),
      isDeepEqual,
    ),
    fillType,
    contextOpacity: getMultiNumberValue(
      fills.map((fill) => fill.contextSettings.opacity),
    ),
    gradient: gradient ?? fills[0].gradient,
    pattern: getMultiValue(patterns, isDeepEqual) ?? patterns[0],
    shader:
      getMultiValue(
        fills.map((fill) => fill.shader),
        isDeepEqual,
      ) ?? SketchModel.shader(),
  };
}

export function getEditableStyles<T, U>(
  styleMatrix: T[][],
  reduceToEditable: (style: T[]) => U,
) {
  return zipLongest(undefined, ...styleMatrix).map((styles) =>
    reduceToEditable(styles.flatMap((style) => (style ? [style] : []))),
  );
}
