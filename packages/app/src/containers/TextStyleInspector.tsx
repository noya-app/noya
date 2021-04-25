import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Divider } from 'noya-designsystem';
import { Selectors } from 'noya-state';
import { useCallback, memo, useState, useMemo } from 'react';
import useShallowArray from '../hooks/useShallowArray';
import TextOptionsRow from '../components/inspector/TextOptionsRow';
import TextAlignmentRow from '../components/inspector/TextAlignmentRow';
import TextStyleRow from '../components/inspector/TextStyleRow';
import {
  useSelector,
  useApplicationState,
} from '../contexts/ApplicationStateContext';

export default memo(function TextStyleInspector() {
  const [, dispatch] = useApplicationState();

  //Todo: Handle multiple texts
  const selectedTextStyles = useShallowArray(
    useSelector(Selectors.getSelectedTextStyles),
  );

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

  const fontDecoration = useMemo(
    () =>
      selectedTextStyles.map(
        (style) => style?.textStyle?.encodedAttributes.underlineStyle || 0,
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

  const [fontDecorator, setFontDecorator] = useState(fontDecoration[0]);
  const [fontCase, setFontCase] = useState('0');

  const [fontAlignment, setFontAlignment] = useState('0');
  const [verticalAlignment, setFontVerticalAlignment] = useState('0');
  const [horizontalAlignment, setFontHorizontalAlignment] = useState('0');

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
        fontAlignment={fontAlignment}
        fontVerticalAlignment={verticalAlignment}
        fontHorizontalAlignment={horizontalAlignment}
        onChangeFontAlignment={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            setFontAlignment(event.target.value);
          },
          [setFontAlignment],
        )}
        onChangeFontHorizontalAlignment={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            setFontHorizontalAlignment(event.target.value);
          },
          [setFontHorizontalAlignment],
        )}
        onChangeFontVerticalAlignment={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            setFontVerticalAlignment(event.target.value);
          },
          [setFontVerticalAlignment],
        )}
      />
      <Divider />
      <TextOptionsRow
        fontCase={fontCase}
        fontDecorator={fontDecorator}
        onChangeFontDecorator={useCallback((value) => setFontDecorator(value), [
          setFontDecorator,
        ])}
        onChangeFontCase={useCallback(
          (event: React.ChangeEvent<HTMLInputElement>) => {
            setFontCase(event.target.value);
          },
          [setFontCase],
        )}
      />
    </>
  );
});
