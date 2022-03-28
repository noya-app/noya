import React, { memo, ReactNode, useCallback, useMemo, useState } from 'react';

import { useApplicationState, useSelector } from 'noya-app-state-context';
import { Select, Layout } from 'noya-designsystem';
import { useShallowArray } from 'noya-react-utils';
import Sketch from 'noya-file-format';
import {
  EditableBorder,
  getEditableBorder,
  getEditableStyles,
  Selectors,
} from 'noya-state';
import CheckboxArrayController from '../CheckboxArrayController';
import { Primitives } from '../primitives';
import BorderRow from './BorderRow';

const LINE_CAP_OPTIONS = [
  Sketch.LineCapStyle.Butt.toString(),
  Sketch.LineCapStyle.Round.toString(),
  Sketch.LineCapStyle.Projecting.toString(),
];
const LINE_JOIN_OPTIONS = [
  Sketch.LineJoinStyle.Bevel.toString(),
  Sketch.LineJoinStyle.Miter.toString(),
  Sketch.LineJoinStyle.Round.toString(),
];

export default memo(function BorderInspector() {
  const [state, dispatch] = useApplicationState();
  const [expanded, setExpanded] = useState(false);
  const selectLayerId = state.selectedLayerIds[0];

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

  const borderOptions = useMemo(
    () => selectedStyles[0].borderOptions,
    [selectedStyles],
  );

  const getLineCapStyleTitle = useCallback(
    (id: string) => Sketch.LineCapStyle[parseInt(id)],
    [],
  );
  const getLineJoinStyleTitle = useCallback(
    (id: string) => Sketch.LineJoinStyle[parseInt(id)],
    [],
  );

  const onChangeLineCapStyle = useCallback(
    (value: string) => {
      dispatch('setBorderLineCap', parseInt(value));
    },
    [dispatch],
  );
  const onChangeLineJoinStyle = useCallback(
    (value: string) => {
      dispatch('setBorderLineJoin', parseInt(value));
    },
    [dispatch],
  );

  const renderExpandedContent = useCallback(() => {
    return (
      <>
        <Primitives.VerticalSeparator />
        <Layout.Stack />
        <Primitives.VerticalSeparator />
        <Primitives.Row>
          <Primitives.Title>End</Primitives.Title>
          <Layout.Queue size={105} />
          <Primitives.Title>Angles</Primitives.Title>
        </Primitives.Row>
        <Primitives.VerticalSeparator />
        <Primitives.Row>
          <Select
            id="line-end-style"
            value={borderOptions.lineCapStyle.toString()}
            options={LINE_CAP_OPTIONS}
            getTitle={getLineCapStyleTitle}
            onChange={onChangeLineCapStyle}
          />
          <Primitives.HorizontalSeparator />
          <Select
            id="line-join-style"
            value={borderOptions.lineJoinStyle.toString()}
            options={LINE_JOIN_OPTIONS}
            getTitle={getLineJoinStyleTitle}
            onChange={onChangeLineJoinStyle}
          />
        </Primitives.Row>
        <Primitives.VerticalSeparator />
      </>
    );
  }, [
    borderOptions,
    getLineCapStyleTitle,
    getLineJoinStyleTitle,
    onChangeLineCapStyle,
    onChangeLineJoinStyle,
  ]);

  return (
    <CheckboxArrayController<EditableBorder>
      title="Borders"
      id="borders"
      key="borders"
      expanded={expanded}
      value={editableBorders}
      onClickPlus={useCallback(() => dispatch('addNewBorder'), [dispatch])}
      onClickTrash={useCallback(
        () => dispatch('deleteDisabledBorders'),
        [dispatch],
      )}
      onMoveItem={useCallback(
        (sourceIndex, destinationIndex) =>
          dispatch('moveBorder', sourceIndex, destinationIndex),
        [dispatch],
      )}
      onChangeCheckbox={useCallback(
        (index, checked) => dispatch('setBorderEnabled', index, checked),
        [dispatch],
      )}
      onClickExpand={useCallback(
        () => setExpanded(!expanded),
        [setExpanded, expanded],
      )}
      renderExpandedContent={renderExpandedContent}
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
