import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Selectors } from 'noya-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import { isDeepEqual, zipLongest } from 'noya-utils';
import CheckboxArrayController from '../components/inspector/CheckboxArrayController';
import BorderRow from '../components/inspector/BorderRow';
import { DimensionValue } from '../components/inspector/DimensionsInspector';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import useShallowArray from '../hooks/useShallowArray';
import getMultiValue from '../utils/getMultiValue';
import getMultiNumberValue from '../utils/getMultiNumberValue';

type EditableBorder = {
  // TODO: Indeterminate `isEnabled` state
  isEnabled: boolean;
  hasMultipleFills: boolean;
  color?: Sketch.Color;
  fillType?: Sketch.FillType;
  position?: Sketch.BorderPosition;
  thickness?: DimensionValue;
  gradient: Sketch.Gradient;
};

export default memo(function BorderInspector() {
  const [, dispatch] = useApplicationState();

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedStyles),
  );

  const layerBorderLists = useShallowArray(
    selectedStyles.map((style) => style?.borders ?? []),
  );

  const editableBorders = useMemo(
    () =>
      zipLongest(undefined, ...layerBorderLists).map(
        (borders): EditableBorder => {
          const filtered = borders.flatMap((border) =>
            border ? [border] : [],
          );

          const fillType = getMultiValue(
            filtered.map((border) => border.fillType),
            isDeepEqual,
          );

          const gradient = getMultiValue(
            filtered.map((border) => border.gradient),
            isDeepEqual,
          );

          return {
            isEnabled:
              getMultiValue(filtered.map((border) => border.isEnabled)) ?? true,
            hasMultipleFills:
              fillType === undefined ||
              (fillType === Sketch.FillType.Gradient && !gradient),
            color: getMultiValue(
              filtered.map((border) => border.color),
              isDeepEqual,
            ),
            fillType,
            position: getMultiValue(
              filtered.map((border) => border.position),
              isDeepEqual,
            ),
            thickness: getMultiNumberValue(
              filtered.map((border) => border.thickness),
            ),
            gradient: gradient ?? filtered[0].gradient,
          };
        },
      ),
    [layerBorderLists],
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
              onEditGradient: () => {},
            }}
          />
        ),
        [dispatch],
      )}
    />
  );
});
