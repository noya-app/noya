import { useApplicationState } from 'noya-app-state-context';
import { rgbaStringToSketchColor } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { useShallowArray } from 'noya-react-utils';
import { SketchModel } from 'noya-sketch-model';
import {
  EditableFill,
  getEditableFill,
  getEditableStyles,
  getElementLayerForObjectPath,
  getSelectedElementLayerPaths,
} from 'noya-state';
import {
  ElementLayer,
  getAttributeValue,
  useTypescriptCompiler,
} from 'noya-typescript';
import { memo, useCallback, useMemo } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import FillRow from '../components/inspector/FillRow';

function getStyleForElementLayer(elementLayer: ElementLayer): Sketch.Style {
  const backgroundColor = getAttributeValue(
    elementLayer.attributes,
    'background',
  );

  const style = SketchModel.style({
    fills: backgroundColor
      ? [
          SketchModel.fill({
            color: rgbaStringToSketchColor(backgroundColor),
          }),
        ]
      : [],
  });

  return style;
}

export const ElementFillInspector = memo(function ElementFillInspector({
  title,
}: {
  title: string;
}) {
  const [state, dispatch] = useApplicationState();

  const compiler = useTypescriptCompiler();
  const selectedElementPaths = getSelectedElementLayerPaths(state);
  const elementLayers = selectedElementPaths.flatMap((elementPath) => {
    const elementLayer = getElementLayerForObjectPath(
      compiler.environment,
      elementPath,
    );
    return elementLayer ? [elementLayer] : [];
  });

  const selectedStyles = useShallowArray(
    elementLayers.map(getStyleForElementLayer),
  );

  const fillMatrix = useShallowArray(
    selectedStyles.map((style) => style?.fills ?? []),
  );

  const editableFills = useMemo(
    () => getEditableStyles(fillMatrix, getEditableFill),
    [fillMatrix],
  );

  const handleClickPlus = useCallback(() => dispatch('addNewFill'), [dispatch]);
  const handleClickTrash = useCallback(
    () => dispatch('deleteDisabledFills'),
    [dispatch],
  );

  return (
    <ArrayController<EditableFill>
      title={title}
      id={title}
      key={title}
      items={editableFills}
      onClickPlus={editableFills.length === 0 ? handleClickPlus : undefined}
      onClickTrash={editableFills.length > 0 ? handleClickTrash : undefined}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) =>
          dispatch('moveFill', sourceIndex, destinationIndex),
        [dispatch],
      )}
      renderItem={useCallback(
        ({ item, index }: { item: EditableFill; index: number }) => (
          <FillRow
            id={`fill-${index}`}
            // prefix={checkbox}
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
                  layerId: state.selectedLayerIds[0],
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
              fillType: item.pattern.patternFillType,
              onChangeFillType: (value) =>
                dispatch('setPatternFillType', index, value),
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

        [dispatch, state.selectedLayerIds],
      )}
    />
  );
});
