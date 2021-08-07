import Sketch from '@sketch-hq/sketch-file-format-ts';
import { getMultiNumberValue, getMultiValue, Selectors } from 'noya-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import CheckboxArrayController from '../components/inspector/CheckboxArrayController';
import FillRow from '../components/inspector/FillRow';
import { useApplicationState, useSelector } from 'noya-app-state-context';
import useShallowArray from '../hooks/useShallowArray';
import { DimensionValue } from '../components/inspector/DimensionsInspector';
import { SketchPattern } from 'noya-designsystem';
import { isDeepEqual, zipLongest } from 'noya-utils';

type EditableFill = {
  // TODO: Indeterminate `isEnabled` state
  isEnabled: boolean;
  hasMultipleFills: boolean;
  color?: Sketch.Color;
  fillType?: Sketch.FillType;
  contextOpacity?: DimensionValue;
  gradient: Sketch.Gradient;
  pattern: SketchPattern;
};

export default memo(function FillInspector({
  title,
  allowMoreThanOne,
}: {
  title: string;
  allowMoreThanOne: boolean;
}) {
  const [state, dispatch] = useApplicationState();
  const selectLayerId = state.selectedObjects[0];

  const selectedStyles = useShallowArray(
    useSelector(Selectors.getSelectedStyles),
  );

  const layerFillLists = useShallowArray(
    selectedStyles.map((style) => style?.fills ?? []),
  );

  const editableFills = useMemo(
    () =>
      zipLongest(undefined, ...layerFillLists).map(
        (borders): EditableFill => {
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

          const getPattern = (fill: Sketch.Fill): SketchPattern => ({
            _class: 'pattern',
            patternFillType: fill.patternFillType,
            patternTileScale: fill.patternTileScale,
            image: fill.image,
          });

          const patterns = filtered.map(getPattern);

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
            contextOpacity: getMultiNumberValue(
              filtered.map((border) => border.contextSettings.opacity),
            ),
            gradient: gradient ?? filtered[0].gradient,
            pattern: getMultiValue(patterns, isDeepEqual) ?? patterns[0],
          };
        },
      ),
    [layerFillLists],
  );

  const handleClickPlus = useCallback(() => dispatch('addNewFill'), [dispatch]);

  return (
    <CheckboxArrayController<EditableFill>
      title={title}
      id={title}
      key={title}
      value={editableFills}
      onClickPlus={allowMoreThanOne ? handleClickPlus : undefined}
      onClickTrash={useCallback(() => dispatch('deleteDisabledFills'), [
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
      renderItem={useCallback(
        ({
          item,
          index,
          checkbox,
        }: {
          item: EditableFill;
          index: number;
          checkbox: ReactNode;
        }) => (
          <FillRow
            id={`fill-${index}`}
            prefix={checkbox}
            fillType={item.fillType}
            contextOpacity={item.contextOpacity}
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
              onEditGradient: (stopIndex) =>
                dispatch('setSelectedGradient', {
                  layerId: selectLayerId,
                  fillIndex: index,
                  stopIndex,
                  styleType: 'fills',
                }),
            }}
            patternProps={{
              pattern: item.pattern,
              onChangeFillImage: (value) =>
                dispatch('setFillImage', index, value),
              onChangePatternFillType: (value) =>
                dispatch('setPatternFillType', index, value),
              onChangePatternTileScale: (value) =>
                dispatch('setPatternTileScale', index, value),
            }}
          />
        ),

        [dispatch, selectLayerId],
      )}
    />
  );
});
