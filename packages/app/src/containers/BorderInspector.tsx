import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import {
  EditableBorder,
  getEditableBorder,
  getEditableStyles,
  Selectors,
} from 'noya-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import BorderRow from '../components/inspector/BorderRow';
import CheckboxArrayController from '../components/inspector/CheckboxArrayController';
import useShallowArray from '../hooks/useShallowArray';

export default memo(function BorderInspector() {
  const [state, dispatch] = useApplicationState();
  const selectLayerId = state.selectedObjects[0];

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedStyles),
  );

  const borderMatrix = useShallowArray(
    selectedStyles.map((style) => style?.borders ?? []),
  );

  const editableBorders = useMemo(
    () => getEditableStyles(borderMatrix, getEditableBorder),
    [borderMatrix],
  );

  return (
    <CheckboxArrayController<EditableBorder>
      title="Borders"
      id="borders"
      key="borders"
      value={editableBorders}
      onClickPlus={useCallback(() => dispatch('addNewBorder'), [dispatch])}
      onClickTrash={useCallback(() => dispatch('deleteDisabledBorders'), [
        dispatch,
      ])}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) =>
          dispatch('moveBorder', sourceIndex, destinationIndex),
        [dispatch],
      )}
      onChangeCheckbox={useCallback(
        (index, checked) => dispatch('setBorderEnabled', index, checked),
        [dispatch],
      )}
      renderItem={useCallback(
        ({
          item,
          index,
          checkbox,
        }: {
          item: EditableBorder;
          index: number;
          checkbox: ReactNode;
        }) => (
          <BorderRow
            id={`border-${index}`}
            prefix={checkbox}
            fillType={item.fillType ?? Sketch.FillType.Color}
            hasMultipleFills={item.hasMultipleFills}
            width={item.thickness}
            position={item.position ?? Sketch.BorderPosition.Inside}
            onSetWidth={(value, mode) =>
              dispatch('setBorderWidth', index, value, mode)
            }
            onChangePosition={(value) => {
              dispatch('setBorderPosition', index, value);
            }}
            onChangeFillType={(value) =>
              dispatch('setBorderFillType', index, value)
            }
            colorProps={{
              color: item.color,
              onChangeColor: (value) =>
                dispatch('setBorderColor', index, value),
            }}
            gradientProps={{
              gradient: item.gradient,
              onChangeGradientColor: (value, stopIndex) =>
                dispatch('setBorderGradientColor', index, stopIndex, value),
              onChangeGradientPosition: (value, stopIndex) =>
                dispatch('setBorderGradientPosition', index, stopIndex, value),
              onAddGradientStop: (color, position) =>
                dispatch('addBorderGradientStop', index, color, position),
              onDeleteGradientStop: (value) =>
                dispatch('deleteBorderGradientStop', index, value),
              onChangeGradientType: (value) =>
                dispatch('setBorderGradientType', index, value),
              onChangeGradient: (value) =>
                dispatch('setBorderGradient', index, value),
              onEditGradient: (stopIndex) =>
                dispatch('setSelectedGradient', {
                  layerId: selectLayerId,
                  fillIndex: index,
                  stopIndex,
                  styleType: 'borders',
                }),
            }}
          />
        ),
        [dispatch, selectLayerId],
      )}
    />
  );
});
