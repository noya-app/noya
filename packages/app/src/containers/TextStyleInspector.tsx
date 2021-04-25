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

  const firstFontFamily = useMemo(() => fontFamily[0] || 'Arial', [fontFamily]);

  const [fontDecorator, setFontDecorator] = useState(fontDecoration[0]);
  const [fontCase, setFontCase] = useState('0');

  const [fontAlignment, setFontAlignment] = useState('horizontal');
  const [verticalAlignment, setFontVerticalAlignment] = useState('0');
  const [horizontalAlignment, setFontHorizontalAlignment] = useState('left');

  return (
    <>
      <TextStyleRow
        fontColor={firstColor}
        fontFamily={firstFontFamily}
        fontSize={fontSize[0]}
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
