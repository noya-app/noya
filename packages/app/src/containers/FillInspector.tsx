import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import FillRow from '../components/inspector/FillRow';
import {
  useApplicationState,
  useSelector,
} from '../contexts/ApplicationStateContext';
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
  ]);
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
            value={
              item.fillType === Sketch.FillType.Gradient
                ? item.gradient
                : item.fillType === Sketch.FillType.Color
                ? item.color
                : {
                    _class: 'pattern',
                    image: item.image,
                    patternFillType: item.patternFillType,
                    patternTileScale: item.patternTileScale,
                  }
            }
            contextOpacity={item.contextSettings.opacity}
            prefix={checkbox}
            onChangeFillType={(value) =>
              dispatch('setFillFillType', index, value)
            }
            onChangeGradientColor={(value, stopIndex) =>
              dispatch('setFillGradientColor', index, stopIndex, value)
            }
            onChangeGradientPosition={(value, stopIndex) => {
              dispatch('setFillGradientPosition', index, stopIndex, value);
            }}
            onAddGradientStop={(color, position) =>
              dispatch('addFillGradientStop', index, color, position)
            }
            onDeleteGradientStop={(value) =>
              dispatch('deleteFillGradientStop', index, value)
            }
            onChangeGradientType={(value) =>
              dispatch('setFillGradientType', index, value)
            }
            onChangeGradient={(value) =>
              dispatch('setFillGradient', index, value)
            }
            onChangeOpacity={(value) =>
              dispatch('setFillOpacity', index, value)
            }
            onNudgeOpacity={(value) =>
              dispatch('setFillOpacity', index, value, 'adjust')
            }
            onChangeColor={(value) => dispatch('setFillColor', index, value)}
            onChangeFillImage={(value) =>
              dispatch('setFillImage', index, value)
            }
            onChangePatternFillType={(value) =>
              dispatch('setPatternFillType', index, value)
            }
            onChangePatternTileScale={(value) =>
              dispatch('setPatternTileScale', index, value)
            }
            onChangeContextOpacity={(value) =>
              dispatch('setFillContextSettingsOpacity', index, value)
            }
            onNudgeContextOpacity={(value) =>
              dispatch('setFillContextSettingsOpacity', index, value, 'adjust')
            }
          />
        ),

        [dispatch],
      )}
    </ArrayController>
  );
});
