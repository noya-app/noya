import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Divider } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import FillInspector from './FillInspector';
import withSeparatorElements from '../utils/withSeparatorElements';
import NameInspector from '../components/inspector/NameInspector';
import OpacityInspector from './OpacityInspector';
import BorderInspector from './BorderInspector';
import ShadowInspector from './ShadowInspector';
import { delimitedPath } from 'noya-utils';
import TextOptionsRow, {
  SimpleTextDecoration,
} from '../components/inspector/TextOptionsRow';
import TextAlignmentRow from '../components/inspector/TextLayoutRow';
import TextStyleRow from '../components/inspector/TextStyleRow';
import getMultiValue from '../utils/getMultiValue';

const TextStyleInspector = memo(function TextStyleInspector() {
  const [, dispatch] = useApplicationState();

  const seletedText = useShallowArray(useSelector(Selectors.getSelectedStyles));

  const getTextStyleAttributes = useCallback((styles: Sketch.Style[]) => {
    const textStyle = styles[0]?.textStyle;
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
      fontSize: getMultiValue<number | undefined>(
        styles.map(
          (s) =>
            s.textStyle?.encodedAttributes.MSAttributedStringFontAttribute
              .attributes.size,
        ),
      )
        ? encodedAttributes?.MSAttributedStringFontAttribute.attributes.size
        : undefined,
      lineHeight: getMultiValue<number | undefined>(
        styles.map(
          (s) =>
            s?.textStyle?.encodedAttributes.paragraphStyle?.maximumLineHeight,
        ),
      )
        ? paragraphStyle?.maximumLineHeight ?? 22
        : undefined,
      horizontalAlignment: getMultiValue<
        Sketch.TextHorizontalAlignment | undefined
      >(
        styles.map(
          (s) => s?.textStyle?.encodedAttributes.paragraphStyle?.alignment,
        ),
      )
        ? paragraphStyle?.alignment ?? Sketch.TextHorizontalAlignment.Left
        : undefined,
      textTransform: getMultiValue<Sketch.TextTransform | undefined>(
        styles.map(
          (s) =>
            s?.textStyle?.encodedAttributes
              ?.MSAttributedStringTextTransformAttribute,
        ),
      )
        ? encodedAttributes?.MSAttributedStringTextTransformAttribute ??
          Sketch.TextTransform.None
        : undefined,
      textDecoration: encodedAttributes?.underlineStyle
        ? 'underline'
        : encodedAttributes?.strikethroughStyle
        ? 'strikethrough'
        : 'none',
      letterSpacing: getMultiValue<number | undefined>(
        styles.map((s) => s?.textStyle?.encodedAttributes?.kerning),
      )
        ? encodedAttributes?.kerning || 0
        : undefined,
      paragraphSpacing: getMultiValue<number | undefined>(
        styles.map(
          (s) =>
            s?.textStyle?.encodedAttributes?.paragraphStyle?.paragraphSpacing,
        ),
      )
        ? paragraphStyle?.paragraphSpacing || 0
        : undefined,
      verticalAlignment: getMultiValue<number | undefined>(
        styles.map((s) => s?.textStyle?.verticalAlignment),
      )
        ? textStyle?.verticalAlignment ?? Sketch.TextVerticalAlignment.Top
        : undefined,
    };
  }, []);

  const {
    fontColor,
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

  const fontAlignment = 0 as Sketch.TextBehaviour;
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
        textCase={textTransform}
        textDecorator={textDecoration as SimpleTextDecoration}
        onChangeTextDecorator={useCallback(
          (value) => dispatch('setTextDecoration', value),
          [dispatch],
        )}
        onChangeTextCase={useCallback(
          (value: Sketch.TextTransform) => dispatch('setTextCase', value),
          [dispatch],
        )}
      />
    </>
  );
});

export default memo(function ThemeTextStyleInspector() {
  const [, dispatch] = useApplicationState();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedThemeTextStyles),
  );

  const handleNameChange = useCallback(
    (value: string) =>
      dispatch(
        'setTextStyleName',
        selectedStyles.map((v) => v.do_objectID),
        value,
      ),
    [dispatch, selectedStyles],
  );

  if (selectedStyles.length === 0) return null;

  const elements = [
    <NameInspector
      names={selectedStyles.map((v) => delimitedPath.basename(v.name))}
      onNameChange={handleNameChange}
    />,
    <TextStyleInspector />,
    <OpacityInspector />,
    <FillInspector />,
    <BorderInspector />,
    <ShadowInspector />,
  ];

  return <>{withSeparatorElements(elements, <Divider />)}</>;
});
