import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useDispatch, useSelector } from 'noya-app-state-context';
import { Divider } from 'noya-designsystem';
import { getEditableTextStyle, getMultiValue, Selectors } from 'noya-state';
import { memo, useCallback, useMemo } from 'react';
import TextLayoutRow from '../components/inspector/TextLayoutRow';
import TextOptionsRow from '../components/inspector/TextOptionsRow';
import TextStyleRow from '../components/inspector/TextStyleRow';
import useShallowArray from '../hooks/useShallowArray';

export default memo(function TextStyleInspector() {
  const dispatch = useDispatch();

  const textLayers = useShallowArray(
    useSelector(Selectors.getSelectedTextLayers),
  );

  const textBehavior = getMultiValue(
    textLayers.map((layer) => layer.textBehaviour),
  );

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedStyles),
  );

  const textStyles = useShallowArray(
    selectedStyles.flatMap((style) =>
      style.textStyle ? [style.textStyle] : [],
    ),
  );

  const editableTextStyle = useMemo(() => getEditableTextStyle(textStyles), [
    textStyles,
  ]);

  return (
    <>
      <TextStyleRow
        fontFamily={editableTextStyle.fontFamily}
        fontVariant={editableTextStyle.fontVariant}
        fontSize={editableTextStyle.fontSize}
        fontColor={editableTextStyle.fontColor}
        letterSpacing={editableTextStyle.letterSpacing}
        lineSpacing={editableTextStyle.lineSpacing}
        paragraphSpacing={editableTextStyle.paragraphSpacing}
        onChangeFontFamily={useCallback(
          (value) => dispatch('setTextFontName', value),
          [dispatch],
        )}
        onChangeFontVariant={useCallback(
          (value) => dispatch('setTextFontVariant', value),
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
      <TextLayoutRow
        textLayout={textBehavior}
        textVerticalAlignment={editableTextStyle.verticalAlignment}
        textHorizontalAlignment={editableTextStyle.horizontalAlignment}
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
        textTransform={editableTextStyle.textTransform}
        textDecoration={editableTextStyle.textDecoration}
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
