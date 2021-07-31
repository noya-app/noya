import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import FillRow from '../components/inspector/FillRow';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import useShallowArray from '../hooks/useShallowArray';

export default memo(function FillInspector({
  title,
  allowMoreThanOne,
}: {
  title: string;
  allowMoreThanOne: boolean;
}) {
  const [, dispatch] = useApplicationState();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedStyles),
  );

  const fills = useMemo(() => selectedStyles.map((style) => style?.fills), [
    selectedStyles,
  ]).reverse();

  // TODO: Modify all fills
  const firstFill = useMemo(() => fills[0] || [], [fills]);
  return (
    <ArrayController<Sketch.Fill>
      title={title}
      id={title}
      key={title}
      value={firstFill}
      onClickPlus={useCallback(
        () => (!allowMoreThanOne && firstFill[0] ? [] : dispatch('addNewFill')),
        [dispatch, allowMoreThanOne, firstFill],
      )}
      onClickTrash={useCallback(() => dispatch('deleteDisabledFills'), [
        dispatch,
      ])}
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
          item: Sketch.Fill;
          index: number;
          checkbox: ReactNode;
        }) => (
          <FillRow
            id={`fill-${index}`}
            prefix={checkbox}
            fillType={item.fillType}
            contextOpacity={item.contextSettings.opacity}
            onChangeFillIndex={() => dispatch('setFillPopoverIndex', index)}
            onSetOpacity={(value, mode) =>
              dispatch('setFillOpacity', index, value, mode)
            }
            onSetContextOpacity={(value, mode) =>
              dispatch('setFillContextSettingsOpacity', index, value, mode)
            }
            onChangeFillType={(value) =>
              dispatch('setFillFillType', index, value)
            }
            colorProps={{
              color: item.color,
              onChangeColor: (value) => dispatch('setFillColor', index, value),
            }}
            gradientProps={{
              gradient: item.gradient,
              onChangeGradientColor: (value, stopIndex) =>
                dispatch('setFillGradientColor', index, stopIndex, value),
              onChangeGradientPosition: (value, stopIndex) =>
                dispatch('setFillGradientPosition', index, stopIndex, value),
              onAddGradientStop: (color, position) =>
                dispatch('addFillGradientStop', index, color, position),
              onDeleteGradientStop: (value) =>
                dispatch('deleteFillGradientStop', index, value),
              onChangeGradientType: (value) =>
                dispatch('setFillGradientType', index, value),
              onChangeGradient: (value) =>
                dispatch('setFillGradient', index, value),
            }}
            patternProps={{
              pattern: {
                _class: 'pattern',
                patternFillType: item.patternFillType,
                patternTileScale: item.patternTileScale,
                image: item.image,
              },
              onChangeFillImage: (value) =>
                dispatch('setFillImage', index, value),
              onChangePatternFillType: (value) =>
                dispatch('setPatternFillType', index, value),
              onChangePatternTileScale: (value) =>
                dispatch('setPatternTileScale', index, value),
            }}
          />
        ),

        [dispatch],
      )}
    </ArrayController>
  );
});
