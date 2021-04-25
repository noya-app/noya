import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Divider } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { useCallback, memo, useMemo } from 'react';
import useShallowArray from '../hooks/useShallowArray';
import TextOptionsRow from '../components/inspector/TextOptionsRow';
import TextAlignmentRow from '../components/inspector/TextAlignmentRow';
import TextStyleRow from '../components/inspector/TextStyleRow';
import {
  useSelector,
  useApplicationState,
} from '../contexts/ApplicationStateContext';

/**
 * TODO: Handle mixed styles
 * TODO: Maybe some of this style to a selector
 */

export default memo(function TextStyleInspector() {
  const [, dispatch] = useApplicationState();

  //Todo: Handle multiple texts
  const selectedTextStyles = useShallowArray(
    useSelector(Selectors.getSelectedTextStyles),
  );

  const seletedText = useShallowArray(useSelector(Selectors.getSelectedText));

  const fontColor = useMemo(
    () =>
      selectedTextStyles.map(
        (style) =>
          style?.textStyle?.encodedAttributes.MSAttributedStringColorAttribute,
      ),
    [selectedTextStyles],
  );

  const fontFamily = useMemo(
    () =>
      selectedTextStyles.map(
        (style) =>
          style?.textStyle?.encodedAttributes.MSAttributedStringFontAttribute
            .attributes.name,
      ),
    [selectedTextStyles],
  );

  const fontSize = useMemo(
    () =>
      selectedTextStyles.map(
        (style) =>
          style?.textStyle?.encodedAttributes.MSAttributedStringFontAttribute
            .attributes.size || 24,
      ),
    [selectedTextStyles],
  );

  const firstColor = useMemo(
    () =>
      fontColor[0] ||
      ({
        _class: 'color',
        red: 0.5,
        blue: 0.5,
        green: 0.5,
        alpha: 0.5,
      } as Sketch.Color),
    [fontColor],
  );

  const lineSpacing = useMemo(
    () =>
      selectedTextStyles.map(
        (style) => style?.textStyle?.encodedAttributes.kerning,
      ),
    [selectedTextStyles],
  );
  const letterSpacing = useMemo(
    () =>
      selectedTextStyles.map(
        (style) =>
          style?.textStyle?.encodedAttributes.paragraphStyle?.maximumLineHeight,
      ),
    [selectedTextStyles],
  );
  const paragraphSpacing = useMemo(
    () =>
      selectedTextStyles.map(
        (style) =>
          style?.textStyle?.encodedAttributes.paragraphStyle?.paragraphSpacing,
      ),
    [selectedTextStyles],
  );

  const fontAlignment = useMemo(
    () => seletedText.map((text) => text.textBehaviour),
    [seletedText],
  );

  const horizontalAlignment = useMemo(
    () =>
      seletedText.map(
        (text) =>
          text.style?.textStyle?.encodedAttributes.paragraphStyle?.alignment,
      ),
    [seletedText],
  );

  const verticalAlignment = useMemo(
    () => seletedText.map((text) => text.style?.textStyle?.verticalAlignment),
    [seletedText],
  );

  const fontDecoration = useMemo(
    () =>
      selectedTextStyles.map((style) =>
        style?.textStyle?.encodedAttributes.underlineStyle
          ? 1
          : style?.textStyle?.encodedAttributes.strikethroughStyle
          ? 2
          : 0,
      ),
    [selectedTextStyles],
  );

  const fontCase = useMemo(
    () =>
      selectedTextStyles.map(
        (style) =>
          style?.textStyle?.encodedAttributes
            .MSAttributedStringTextTransformAttribute || 0,
      ),
    [selectedTextStyles],
  );

  // default value for the spacing (?)
  return (
    <>
      <TextStyleRow
        fontColor={firstColor}
        fontFamily={fontFamily[0] || 'Arial'}
        fontSize={fontSize[0]}
        lineSpacing={lineSpacing[0] !== undefined ? lineSpacing[0] : 0}
        letterSpacing={letterSpacing[0] || 0}
        paragraphSpacing={paragraphSpacing[0] || 0}
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
        fontAlignment={fontAlignment[0] || 0}
        fontVerticalAlignment={verticalAlignment[0] || 0}
        fontHorizontalAlignment={horizontalAlignment[0] || 0}
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
        fontCase={fontCase[0]}
        fontDecorator={fontDecoration[0]}
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
