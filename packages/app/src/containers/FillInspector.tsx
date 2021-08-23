import { useApplicationState, useSelector } from 'noya-app-state-context';
import {
  EditableFill,
  getEditableFill,
  getEditableStyles,
  Selectors,
} from 'noya-state';
import { memo, ReactNode, useCallback, useMemo } from 'react';
import CheckboxArrayController from '../components/inspector/CheckboxArrayController';
import FillRow from '../components/inspector/FillRow';
import { useShallowArray } from 'noya-react-utils';

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

  const fillMatrix = useShallowArray(
    selectedStyles.map((style) => style?.fills ?? []),
  );

  const editableFills = useMemo(
    () => getEditableStyles(fillMatrix, getEditableFill),
    [fillMatrix],
  );

  const handleClickPlus = useCallback(() => dispatch('addNewFill'), [dispatch]);

  return (
    <CheckboxArrayController<EditableFill>
      title={title}
      id={title}
      key={title}
      value={editableFills}
      onClickPlus={allowMoreThanOne ? handleClickPlus : undefined}
      onClickTrash={useCallback(
        () => dispatch('deleteDisabledFills'),
        [dispatch],
      )}
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
            shaderProps={{
              shader: item.shader,
              onAddShaderVariable: () => dispatch('addShaderVariable', index),
              onDeleteShaderVariable: (name) =>
                dispatch('deleteShaderVariable', index, name),
              onChangeShaderString: (value) =>
                dispatch('setShaderString', index, value),
              onChangeShaderVariableName: (oldName, newName) =>
                dispatch('setShaderVariableName', index, oldName, newName),
              onChangeShaderVariableValue: (name, value) =>
                dispatch('setShaderVariableValue', index, name, value),
              onNudgeShaderVariableValue: (name, value) =>
                dispatch('nudgeShaderVariableValue', index, name, value),
            }}
          />
        ),

        [dispatch, selectLayerId],
      )}
    />
  );
});
