import Sketch from 'noya-file-format';
import { SketchPattern } from 'noya-designsystem';
import { decodeFontName, FontTraits } from 'noya-fonts';
import { getMultiNumberValue, getMultiValue, Selectors } from 'noya-state';
import { isDeepEqual, zipLongest } from 'noya-utils';
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

export function getEditableTextStyle(
  textStyles: Sketch.TextStyle[],
): EditableTextStyle {
  const properties = textStyles.map(getEditableTextStyleProperties);

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

export function getEditableShadow(shadows: Sketch.Shadow[]): EditableShadow {
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
  pattern: SketchPattern;
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

  const getPattern = (fill: Sketch.Fill): SketchPattern => ({
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
