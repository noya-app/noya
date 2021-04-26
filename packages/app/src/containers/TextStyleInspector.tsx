import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Divider } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { useCallback, memo, useMemo } from 'react';
import useShallowArray from '../hooks/useShallowArray';
import TextOptionsRow from '../components/inspector/TextOptionsRow';
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

  const getTextStyleAttributes = useCallback((layer: Sketch.Text) => {
    const textStyle = layer.style?.textStyle;
    const encodedAttributes = textStyle?.encodedAttributes;
    const paragraphStyle = encodedAttributes?.paragraphStyle;

    return {
      fontColor:
        encodedAttributes?.MSAttributedStringColorAttribute ||
        ({
          _class: 'color',
          red: 0.5,
          blue: 0.5,
          green: 0.5,
          alpha: 0.5,
        } as Sketch.Color),
      fontFamily:
        encodedAttributes?.MSAttributedStringFontAttribute.attributes.name ||
        'Arial',
      fontSize:
        encodedAttributes?.MSAttributedStringFontAttribute.attributes.size ??
        12,
      lineHeight: paragraphStyle?.maximumLineHeight,
      horizontalAlignment:
        paragraphStyle?.alignment ?? Sketch.TextHorizontalAlignment.Left,
      textTransform:
        encodedAttributes?.MSAttributedStringTextTransformAttribute ??
        Sketch.TextTransform.None,
      textDecoration: encodedAttributes?.underlineStyle
        ? 1
        : encodedAttributes?.strikethroughStyle
        ? 2
        : 0,
      letterSpacing: encodedAttributes?.kerning,
      paragraphSpacing: paragraphStyle?.paragraphSpacing,
      verticalAlignment: textStyle?.verticalAlignment,
      fontAlignment: layer.textBehaviour,
    };
  }, []);

  const textStyleAttributes = useMemo(
    () => getTextStyleAttributes(seletedText[0]),
    [getTextStyleAttributes, seletedText],
  );

  // default value for the spacing (?)
  return (
    <>
      <TextStyleRow
        fontColor={textStyleAttributes.fontColor}
        fontFamily={textStyleAttributes.fontFamily}
        fontSize={textStyleAttributes.fontSize}
        lineSpacing={textStyleAttributes.lineHeight || 0}
        letterSpacing={textStyleAttributes.letterSpacing || 0}
        paragraphSpacing={textStyleAttributes.paragraphSpacing || 0}
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
        textLayout={textStyleAttributes.fontAlignment}
        textVerticalAlignment={textStyleAttributes.verticalAlignment || 0}
        textHorizontalAlignment={textStyleAttributes.horizontalAlignment || 0}
        onChangeFontAlignment={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch('setTextAlignment', Number(event.target.value));
          },
          [dispatch],
        )}
        onChangeFontHorizontalAlignment={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch('setTextHorizontalAlignment', Number(event.target.value));
          },
          [dispatch],
        )}
        onChangeFontVerticalAlignment={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch('setTextVerticalAlignment', Number(event.target.value));
          },
          [dispatch],
        )}
      />
      <Divider />
      <TextOptionsRow
        fontCase={textStyleAttributes.textTransform}
        fontDecorator={textStyleAttributes.textDecoration}
        onChangeFontDecorator={useCallback(
          (value) => dispatch('setTextDecoration', value),
          [dispatch],
        )}
        onChangeFontCase={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            dispatch('setTextCase', Number(event.target.value));
          },
          [dispatch],
        )}
      />
    </>
  );
});
