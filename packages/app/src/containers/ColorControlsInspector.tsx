import { useApplicationState, useSelector } from 'noya-app-state-context';
import { useShallowArray } from 'noya-react-utils';
import { getMultiNumberValue, Selectors, SetNumberMode } from 'noya-state';
import { interpolate, InterpolateOptions } from 'noya-utils';
import { memo, useCallback, useMemo } from 'react';
import ColorControlsRow from '../components/inspector/ColorControlsRow';
import EnableableElementController from '../components/inspector/EnableableElementController';

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

export const saturationInterpolator = makeInterpolator({
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

  const interpolatedHue =
    hue !== undefined ? hueInterpolator.toDisplay(hue) : undefined;

  const interpolatedSaturation =
    saturation !== undefined
      ? saturationInterpolator.toDisplay(saturation)
      : undefined;

  const interpolatedBrightness =
    brightness !== undefined
      ? brightnessInterpolator.toDisplay(brightness)
      : undefined;

  const interpolatedContrast =
    contrast !== undefined
      ? contrastInterpolator.toDisplay(contrast)
      : undefined;

  const handleChangeHue = useCallback(
    (value: number, mode: SetNumberMode) =>
      dispatch('setHue', hueInterpolator.fromDisplay(value), mode),
    [dispatch],
  );

  const handleChangeSaturation = useCallback(
    (value: number, mode: SetNumberMode) =>
      dispatch(
        'setSaturation',
        mode === 'adjust'
          ? value / 100
          : saturationInterpolator.fromDisplay(value),
        mode,
      ),
    [dispatch],
  );

  const handleChangeBrightness = useCallback(
    (value: number, mode: SetNumberMode) =>
      dispatch(
        'setBrightness',
        brightnessInterpolator.fromDisplay(value),
        mode,
      ),
    [dispatch],
  );

  const handleChangeContrast = useCallback(
    (value: number, mode: SetNumberMode) => {
      if (contrast !== undefined && mode === 'adjust') {
        const displayValue = contrastInterpolator.toDisplay(contrast);
        const newValue = contrastInterpolator.fromDisplay(displayValue + value);
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
    },
    [contrast, dispatch],
  );

  return (
    <EnableableElementController
      id="color-adjust"
      title="Color Adjust"
      isEnabled={isEnabled}
      onChangeIsEnabled={useCallback(
        (isEnabled) => dispatch('setColorControlsEnabled', isEnabled),
        [dispatch],
      )}
    >
      <ColorControlsRow
        id={'color-controls'}
        hue={interpolatedHue}
        saturation={interpolatedSaturation}
        brightness={interpolatedBrightness}
        contrast={interpolatedContrast}
        onChangeHue={handleChangeHue}
        onChangeSaturation={handleChangeSaturation}
        onChangeBrightness={handleChangeBrightness}
        onChangeContrast={handleChangeContrast}
      />
    </EnableableElementController>
  );
});
