import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Divider } from 'noya-designsystem';
import { Selectors, TextStyleSelectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import TextAlignmentRow from '../components/inspector/TextLayoutRow';
import TextOptionsRow from '../components/inspector/TextOptionsRow';
import TextStyleRow from '../components/inspector/TextStyleRow';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import useShallowArray from '../hooks/useShallowArray';

export default memo(function TextStyleInspector() {
  const [state, dispatch] = useApplicationState();

  const textLayers = useShallowArray(
    useSelector(Selectors.getSelectedTextLayers),
  );
  const textStyles = useShallowArray(useSelector(Selectors.getSelectedStyles));
  const currentTab = Selectors.getCurrentTab(state);

  const selectedText = currentTab === 'canvas' ? textLayers : textStyles;

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
  } = useMemo(
    () => TextStyleSelectors.getEditableTextStyleAttributes(selectedText),
    [selectedText],
  );

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
          (value, mode) => dispatch('setTextFontSize', value, mode),
          [dispatch],
        )}
        onChangeLineSpacing={useCallback(
          (value, mode) => dispatch('setTextLetterSpacing', value, mode),
          [dispatch],
        )}
        onChangeLetterSpacing={useCallback(
          (value, mode) => dispatch('setTextLineSpacing', value, mode),
          [dispatch],
        )}
        onChangeParagraphSpacing={useCallback(
          (value, mode) => dispatch('setTextParagraphSpacing', value, mode),
          [dispatch],
        )}
      />
      <Divider />
      <TextAlignmentRow
        textLayout={currentTab === 'canvas' ? fontAlignment : undefined}
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
