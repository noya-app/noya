import { useApplicationState } from 'noya-app-state-context';
import { rgbaStringToSketchColor } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { useShallowArray } from 'noya-react-utils';
import { SketchModel } from 'noya-sketch-model';
import {
  EditableBorder,
  getEditableBorder,
  getEditableStyles,
  getElementLayerForObjectPath,
  getSelectedElementLayerPaths,
} from 'noya-state';
import {
  ElementLayer,
  getAttributeValue,
  parseIntSafe,
  useTypescriptCompiler,
} from 'noya-typescript';
import { memo, useCallback, useMemo } from 'react';
import ArrayController from '../components/inspector/ArrayController';
import BorderRow from '../components/inspector/BorderRow';

function getStyleForElementLayer(elementLayer: ElementLayer): Sketch.Style {
  const borderColor = getAttributeValue(elementLayer.attributes, 'borderColor');
  const borderWidth =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'borderWidth')) ??
    0;

  const style = SketchModel.style({
    borders: borderColor
      ? [
          SketchModel.border({
            color: rgbaStringToSketchColor(borderColor),
            thickness: borderWidth,
            position: Sketch.BorderPosition.Inside,
          }),
        ]
      : [],
  });

  return style;
}

export const ElementBorderInspector = memo(function ElementBorderInspector() {
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

  const borderMatrix = useShallowArray(
    selectedStyles.map((style) => style?.borders ?? []),
  );

  const editableBorders = useMemo(
    () => getEditableStyles(borderMatrix, getEditableBorder),
    [borderMatrix],
  );

  const handleClickPlus = useCallback(
    () => dispatch('addNewBorder'),
    [dispatch],
  );
  const handleClickTrash = useCallback(
    () => dispatch('deleteDisabledBorders'),
    [dispatch],
  );
  return (
    <ArrayController<EditableBorder>
      title="Borders"
      id="borders"
      key="borders"
      items={editableBorders}
      onClickPlus={editableBorders.length === 0 ? handleClickPlus : undefined}
      onClickTrash={editableBorders.length > 0 ? handleClickTrash : undefined}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) =>
          dispatch('moveBorder', sourceIndex, destinationIndex),
        [dispatch],
      )}
      renderItem={useCallback(
        ({ item, index }: { item: EditableBorder; index: number }) => (
          <BorderRow
            id={`border-${index}`}
            fillType={item.fillType ?? Sketch.FillType.Color}
            hasMultipleFills={item.hasMultipleFills}
            width={item.thickness}
            position={item.position ?? Sketch.BorderPosition.Inside}
            hasBorderPosition={false}
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
              onEditGradient: (stopIndex) => {},
            }}
          />
        ),
        [dispatch],
      )}
    />
  );
});
