import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import { interpolate, InterpolateOptions } from 'noya-utils';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import ColorControlsRow from '../components/inspector/ColorControlsRow';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import getMultiNumberValue from '../utils/getMultiNumberValue';

function makeInterpolator(options: InterpolateOptions) {
  return {
    toDisplay: (value: number) => Math.round(interpolate(value, options)),
    fromDisplay: (value: number) =>
      interpolate(value, {
        inputRange: options.outputRange,
        outputRange: options.inputRange,
      }),
  };
}

const hueInterpolator = makeInterpolator({
  inputRange: [-Math.PI, Math.PI],
  outputRange: [-100, 100],
});

const saturationInterpolator = makeInterpolator({
  inputRange: [0, 2],
  outputRange: [-100, 100],
});

const brightnessInterpolator = makeInterpolator({
  inputRange: [-1, 1],
  outputRange: [-100, 100],
});

const contrastInterpolator = makeInterpolator({
  inputRange: [0, 1, 4],
  outputRange: [-100, 0, 100],
});

export default memo(function ColorControlsInspector() {
  const [, dispatch] = useApplicationState();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedStyles),
  );

  const colorControls = useMemo(
    () => selectedStyles.map((style) => style.colorControls),
    [selectedStyles],
  );

  const firstColorControls = useMemo(
    () => (colorControls[0].isEnabled ? [colorControls[0]] : []),
    [colorControls],
  );
  const isEnabled = firstColorControls[0]?.isEnabled ?? false;

  const hue = getMultiNumberValue(colorControls.map((control) => control.hue));
  const saturation = getMultiNumberValue(
    colorControls.map((control) => control.saturation),
  );
  const brightness = getMultiNumberValue(
    colorControls.map((control) => control.brightness),
  );
  const contrast = getMultiNumberValue(
    colorControls.map((control) => control.contrast),
  );

  const handleClickPlus = useCallback(() => {
    dispatch('setColorControlsEnabled', true);
  }, [dispatch]);

  const handleClickTrash = useCallback(
    () => dispatch('setColorControlsEnabled', false),
    [dispatch],
  );

  return (
    <ArrayController<Sketch.ColorControls>
      title="Color Adjust"
      id="color-adjust"
      value={firstColorControls}
      alwaysShowTrashIcon
      onClickPlus={isEnabled ? undefined : handleClickPlus}
      onClickTrash={isEnabled ? handleClickTrash : undefined}
      onDeleteItem={useCallback((index) => dispatch('deleteFill', index), [
        dispatch,
      ])}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) =>
          dispatch('moveFill', sourceIndex, destinationIndex),
        [dispatch],
      )}
    >
      {useCallback(
        ({
          item,
          index,
          checkbox,
        }: {
          item: Sketch.ColorControls;
          index: number;
          checkbox: ReactNode;
        }) => (
          <ColorControlsRow
            id={`fill-${index}`}
            hue={hue !== undefined ? hueInterpolator.toDisplay(hue) : undefined}
            onChangeHue={(value, mode) =>
              dispatch('setHue', hueInterpolator.fromDisplay(value), mode)
            }
            saturation={
              saturation !== undefined
                ? saturationInterpolator.toDisplay(saturation)
                : undefined
            }
            onChangeSaturation={(value, mode) =>
              dispatch(
                'setSaturation',
                mode === 'adjust'
                  ? value / 100
                  : saturationInterpolator.fromDisplay(value),
                mode,
              )
            }
            brightness={
              brightness !== undefined
                ? brightnessInterpolator.toDisplay(brightness)
                : undefined
            }
            onChangeBrightness={(value, mode) =>
              dispatch(
                'setBrightness',
                brightnessInterpolator.fromDisplay(value),
                mode,
              )
            }
            contrast={
              contrast !== undefined
                ? contrastInterpolator.toDisplay(contrast)
                : undefined
            }
            onChangeContrast={(value, mode) => {
              if (contrast !== undefined && mode === 'adjust') {
                const displayValue = contrastInterpolator.toDisplay(contrast);
                const newValue = contrastInterpolator.fromDisplay(
                  displayValue + value,
                );
                const delta = newValue - contrast;

                return dispatch('setContrast', delta, mode);
              }

              return dispatch(
                'setContrast',
                mode === 'adjust'
                  ? value / 100
                  : contrastInterpolator.fromDisplay(value),
                mode,
              );
            }}
          />
        ),
        [brightness, contrast, dispatch, hue, saturation],
      )}
    </ArrayController>
  );
});
