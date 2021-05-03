import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Divider } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import TextAlignmentRow from '../components/inspector/TextLayoutRow';
import TextOptionsRow from '../components/inspector/TextOptionsRow';
import TextStyleRow from '../components/inspector/TextStyleRow';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import getMultiValue from '../utils/getMultiValue';

export default memo(function TextStyleInspector() {
  const [, dispatch] = useApplicationState();

  const seletedText = useShallowArray(
    useSelector(Selectors.getSelectedTextLayers),
  );

  const getTextStyleAttributes = useCallback((layers: Sketch.Text[]) => {
    const layer = layers[0];
    const textStyle = layer.style?.textStyle;
    const encodedAttributes = textStyle?.encodedAttributes;
    const paragraphStyle = encodedAttributes?.paragraphStyle;

    const attributes = layer.attributedString.attributes;

    const color: Sketch.Color = {
      _class: 'color',
      red: 0.5,
      blue: 0.5,
      green: 0.5,
      alpha: 0.5,
    };

    return {
      fontColor: encodedAttributes?.MSAttributedStringColorAttribute || color,
      fontFamily:
        encodedAttributes?.MSAttributedStringFontAttribute.attributes.name ||
        'Arial',
      fontSize:
        getMultiValue<number | undefined>(
          layers.map(
            (l) =>
              l.style?.textStyle?.encodedAttributes
                .MSAttributedStringFontAttribute.attributes.size,
          ),
        ) &&
        getMultiValue<number | undefined>(
          attributes.map(
            (a) => a.attributes.MSAttributedStringFontAttribute.attributes.size,
          ),
        )
          ? encodedAttributes?.MSAttributedStringFontAttribute.attributes.size
          : undefined,
      lineHeight:
        getMultiValue<number | undefined>(
          layers.map(
            (l) =>
              l.style?.textStyle?.encodedAttributes.paragraphStyle
                ?.maximumLineHeight,
          ),
        ) &&
        getMultiValue<number | undefined>(
          attributes.map((a) => a.attributes.paragraphStyle?.maximumLineHeight),
        )
          ? paragraphStyle?.maximumLineHeight ?? 22
          : undefined,
      horizontalAlignment:
        getMultiValue<Sketch.TextHorizontalAlignment | undefined>(
          layers.map(
            (l) =>
              l.style?.textStyle?.encodedAttributes.paragraphStyle?.alignment,
          ),
        ) &&
        getMultiValue<Sketch.TextHorizontalAlignment | undefined>(
          attributes.map((a) => a.attributes.paragraphStyle?.alignment),
        )
          ? paragraphStyle?.alignment ?? Sketch.TextHorizontalAlignment.Left
          : undefined,
      textTransform: getMultiValue<Sketch.TextTransform | undefined>(
        layers.map(
          (l) =>
            l.style?.textStyle?.encodedAttributes
              ?.MSAttributedStringTextTransformAttribute,
        ),
      )
        ? encodedAttributes?.MSAttributedStringTextTransformAttribute ??
          Sketch.TextTransform.None
        : undefined,
      textDecoration: encodedAttributes?.underlineStyle
        ? ('underline' as const)
        : encodedAttributes?.strikethroughStyle
        ? ('strikethrough' as const)
        : ('none' as const),
      letterSpacing:
        getMultiValue<number | undefined>(
          layers.map((l) => l.style?.textStyle?.encodedAttributes?.kerning),
        ) &&
        getMultiValue<number | undefined>(
          attributes.map((a) => a.attributes.kerning),
        )
          ? encodedAttributes?.kerning || 0
          : undefined,
      paragraphSpacing:
        getMultiValue<number | undefined>(
          layers.map(
            (l) =>
              l.style?.textStyle?.encodedAttributes?.paragraphStyle
                ?.paragraphSpacing,
          ),
        ) &&
        getMultiValue<number | undefined>(
          attributes.map((a) => a.attributes.paragraphStyle?.paragraphSpacing),
        )
          ? paragraphStyle?.paragraphSpacing || 0
          : undefined,
      verticalAlignment: getMultiValue<number | undefined>(
        layers.map((l) => l.style?.textStyle?.verticalAlignment),
      )
        ? textStyle?.verticalAlignment ?? Sketch.TextVerticalAlignment.Top
        : undefined,
      fontAlignment: getMultiValue<Sketch.TextBehaviour | undefined>(
        layers.map((l) => l.textBehaviour),
      )
        ? layer?.textBehaviour ?? 0
        : undefined,
    };
  }, []);

  const {
    fontColor,
    fontAlignment,
    verticalAlignment,
    textTransform,
    textDecoration,
    horizontalAlignment,
    paragraphSpacing,
    fontFamily,
    fontSize,
    lineHeight,
    letterSpacing,
  } = useMemo(() => getTextStyleAttributes(seletedText), [
    getTextStyleAttributes,
    seletedText,
  ]);

  // default value for the spacing (?)
  return (
    <>
      <TextStyleRow
        fontColor={fontColor}
        fontFamily={fontFamily}
        fontSize={fontSize}
        letterSpacing={letterSpacing}
        lineSpacing={lineHeight}
        paragraphSpacing={paragraphSpacing}
        onChangeFontFamily={useCallback(
          (value) => {
            dispatch('setTextFontName', value);
          },
          [dispatch],
        )}
        onChangeFontWeight={useCallback(
          (value) => {
            dispatch('setTextFontName', '-' + value);
          },
          [dispatch],
        )}
        onChangeFontColor={useCallback(
          (value) => dispatch('setTextColor', value),
          [dispatch],
        )}
        onChangeFontSize={useCallback(
          (value) => dispatch('setTextFontSize', value),
          [dispatch],
        )}
        onChangeLineSpacing={useCallback(
          (value) => dispatch('setTextLetterSpacing', value),
          [dispatch],
        )}
        onChangeLetterSpacing={useCallback(
          (value) => dispatch('setTextLineSpacing', value),
          [dispatch],
        )}
        onChagenParagraphSpacing={useCallback(
          (value) => dispatch('setTextParagraphSpacing', value),
          [dispatch],
        )}
      />
      <Divider />
      <TextAlignmentRow
        textLayout={fontAlignment}
        textVerticalAlignment={verticalAlignment}
        textHorizontalAlignment={horizontalAlignment}
        onChangeTextLayout={useCallback(
          (value: Sketch.TextBehaviour) => {
            dispatch('setTextAlignment', value);
          },
          [dispatch],
        )}
        onChangeTextHorizontalAlignment={useCallback(
          (value: Sketch.TextHorizontalAlignment) => {
            dispatch('setTextHorizontalAlignment', value);
          },
          [dispatch],
        )}
        onChangeTextVerticalAlignment={useCallback(
          (value: Sketch.TextVerticalAlignment) => {
            dispatch('setTextVerticalAlignment', value);
          },
          [dispatch],
        )}
      />
      <Divider />
      <TextOptionsRow
        textTransform={textTransform}
        textDecoration={textDecoration}
        onChangeTextDecoration={useCallback(
          (value) => dispatch('setTextDecoration', value),
          [dispatch],
        )}
        onChangeTextTransform={useCallback(
          (value) => dispatch('setTextTransform', value),
          [dispatch],
        )}
      />
    </>
  );
});
