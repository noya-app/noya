import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Divider } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { useCallback, memo, useMemo } from 'react';
import useShallowArray from '../hooks/useShallowArray';
import TextOptionsRow, {
  SimpleTextDecoration,
} from '../components/inspector/TextOptionsRow';
import TextAlignmentRow from '../components/inspector/TextLayoutRow';
import TextStyleRow from '../components/inspector/TextStyleRow';
import {
  useSelector,
  useApplicationState,
} from '../contexts/ApplicationStateContext';

export default memo(function TextStyleInspector() {
  const [, dispatch] = useApplicationState();

  //Todo: Handle multiple texts
  const seletedText = useShallowArray(useSelector(Selectors.getSelectedText));

  const getTextStyleAttributes = useCallback((layers: Sketch.Text[]) => {
    const layer = layers[0];
    const textStyle = layer.style?.textStyle;
    const encodedAttributes = textStyle?.encodedAttributes;
    const paragraphStyle = encodedAttributes?.paragraphStyle;

    const color = {
      _class: 'color',
      red: 0.5,
      blue: 0.5,
      green: 0.5,
      alpha: 0.5,
    } as Sketch.Color;

    return {
      fontColor: encodedAttributes?.MSAttributedStringColorAttribute || color,
      fontFamily:
        encodedAttributes?.MSAttributedStringFontAttribute.attributes.name ||
        'Arial',
      fontSize: layers.every((layer) => {
        const textStyle = layer.style?.textStyle;
        const encoded = textStyle?.encodedAttributes;
        return (
          encoded?.MSAttributedStringFontAttribute.attributes.size ===
          encodedAttributes?.MSAttributedStringFontAttribute.attributes.size
        );
      })
        ? encodedAttributes?.MSAttributedStringFontAttribute.attributes.size
        : undefined,
      lineHeight: layers.every((layer) => {
        const textStyle = layer.style?.textStyle;
        const encoded = textStyle?.encodedAttributes;
        const paragraph = encoded?.paragraphStyle;

        return (
          paragraph?.maximumLineHeight === paragraphStyle?.maximumLineHeight
        );
      })
        ? paragraphStyle?.maximumLineHeight || 0
        : undefined,
      horizontalAlignment: layers.every((layer) => {
        const textStyle = layer.style?.textStyle;
        const encoded = textStyle?.encodedAttributes;
        const paragraph = encoded?.paragraphStyle;

        return paragraph?.alignment === paragraphStyle?.alignment;
      })
        ? paragraphStyle?.alignment ?? Sketch.TextHorizontalAlignment.Left
        : undefined,
      textTransform: layers.every((layer) => {
        const textStyle = layer.style?.textStyle;
        const encoded = textStyle?.encodedAttributes;
        return (
          encoded?.MSAttributedStringTextTransformAttribute ===
          encodedAttributes?.MSAttributedStringTextTransformAttribute
        );
      })
        ? encodedAttributes?.MSAttributedStringTextTransformAttribute ??
          Sketch.TextTransform.None
        : undefined,
      textDecoration: encodedAttributes?.underlineStyle
        ? SimpleTextDecoration.Underlined
        : encodedAttributes?.strikethroughStyle
        ? SimpleTextDecoration.Strikethrough
        : SimpleTextDecoration.None,
      letterSpacing: layers.every((layer) => {
        const textStyle = layer.style?.textStyle;
        const encoded = textStyle?.encodedAttributes;

        return encodedAttributes?.kerning === encoded?.kerning;
      })
        ? encodedAttributes?.kerning || 0
        : undefined,
      paragraphSpacing: layers.every((layer) => {
        const textStyle = layer.style?.textStyle;
        const encoded = textStyle?.encodedAttributes;
        const paragraph = encoded?.paragraphStyle;

        return paragraphStyle?.paragraphSpacing === paragraph?.paragraphSpacing;
      })
        ? paragraphStyle?.paragraphSpacing || 0
        : undefined,
      verticalAlignment: layers.every((layer) => {
        const style = layer.style?.textStyle;

        return style?.verticalAlignment === textStyle?.verticalAlignment;
      })
        ? textStyle?.verticalAlignment ?? Sketch.TextVerticalAlignment.Top
        : undefined,
      fontAlignment: layers.every(
        (l) => l?.textBehaviour === layer.textBehaviour,
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
        onChangeTextAlignment={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch('setTextAlignment', Number(event.target.value));
          },
          [dispatch],
        )}
        onChangeTextHorizontalAlignment={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch('setTextHorizontalAlignment', Number(event.target.value));
          },
          [dispatch],
        )}
        onChangeTextVerticalAlignment={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch('setTextVerticalAlignment', Number(event.target.value));
          },
          [dispatch],
        )}
      />
      <Divider />
      <TextOptionsRow
        textCase={textTransform}
        textDecorator={textDecoration}
        onChangeTextDecorator={useCallback(
          (value) => dispatch('setTextDecoration', value),
          [dispatch],
        )}
        onChangeTextCase={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch('setTextCase', parseInt(event.target.value));
          },
          [dispatch],
        )}
      />
    </>
  );
});
