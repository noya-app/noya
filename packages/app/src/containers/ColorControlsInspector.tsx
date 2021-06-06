import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import ColorControlsRow from '../components/inspector/ColorControlsRow';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
import useShallowArray from '../hooks/useShallowArray';
import getMultiNumberValue from '../utils/getMultiNumberValue';

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

  const title = 'Color Adjust';

  const handleClickPlus = useCallback(() => {
    dispatch('addNewFill');
  }, [dispatch]);
  const handleClickTrash = useCallback(() => dispatch('deleteDisabledFills'), [
    dispatch,
  ]);

  return (
    <ArrayController<Sketch.ColorControls>
      title={title}
      id={title}
      key={title}
      value={firstColorControls}
      showTrashIfEnabled
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
      onChangeCheckbox={useCallback(
        (index, checked) => dispatch('setFillEnabled', index, checked),
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
            hue={hue}
            saturation={saturation}
            brightness={brightness}
            contrast={contrast}
            onChangeHue={(value, mode) => dispatch('setHue', value, mode)}
            onChangeSaturation={() => {}}
            onChangeBrightness={() => {}}
            onChangeContrast={() => {}}
          />
        ),
        [brightness, contrast, dispatch, hue, saturation],
      )}
    </ArrayController>
  );
});
