import { useApplicationState, useSelector } from 'noya-app-state-context';
import { Spacer } from 'noya-designsystem';
import { toDegrees } from 'noya-geometry';
import {
  clampRotation,
  decodeCurvePoint,
  getMultiNumberValue,
  isPointsLayer,
  PointsLayer,
  Selectors,
  SetNumberMode,
} from 'noya-state';
import { useCallback } from 'react';
import styled from 'styled-components';
import useShallowArray from '../../hooks/useShallowArray';
import CoordinatesInspector from './CoordinatesInspector';
import DimensionInput from './DimensionInput';
import FlipControls from './FlipControls';

export type DimensionValue = number | undefined;

const Row = styled.div(({ theme }) => ({
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'row',
  paddingLeft: '10px',
  paddingRight: '10px',
}));

const LabelContainer = styled.div(({ theme }) => ({
  ...theme.textStyles.small,
  width: '69px',
  display: 'flex',
  alignItems: 'center',
}));

export interface Props {
  width: DimensionValue;
  isFlippedVertical: boolean;
  isFlippedHorizontal: boolean;
  onSetWidth: (value: number, mode: SetNumberMode) => void;
  onSetIsFlippedVertical: (value: boolean) => void;
  onSetIsFlippedHorizontal: (value: boolean) => void;
}

export default function LineInspector({
  width,
  isFlippedVertical,
  isFlippedHorizontal,
  onSetWidth,
  onSetIsFlippedVertical,
  onSetIsFlippedHorizontal,
}: Props) {
  const [state, dispatch] = useApplicationState();
  const selectedLayers = useShallowArray(
    useSelector(Selectors.getSelectedLayers).filter(isPointsLayer),
  );

  const startX = getMultiNumberValue(
    selectedLayers.map(
      (layer) => decodeCurvePoint(layer.points[0], layer.frame).point.x,
    ),
  );
  const startY = getMultiNumberValue(
    selectedLayers.map(
      (layer) => decodeCurvePoint(layer.points[0], layer.frame).point.y,
    ),
  );
  const endX = getMultiNumberValue(
    selectedLayers.map(
      (layer) => decodeCurvePoint(layer.points[1], layer.frame).point.x,
    ),
  );
  const endY = getMultiNumberValue(
    selectedLayers.map(
      (layer) => decodeCurvePoint(layer.points[1], layer.frame).point.y,
    ),
  );

  const findLineRotation = (layer: PointsLayer) => {
    const [startPoint, endPoint] = layer.points.map(
      (point) => decodeCurvePoint(point, layer.frame).point,
    );

    if (!startPoint || !endPoint) return 0;

    let theta = Math.atan2(
      endPoint.y - startPoint.y,
      endPoint.x - startPoint.x,
    );

    return toDegrees(theta);
  };

  const rotation = getMultiNumberValue(
    selectedLayers.map((layer) => {
      return clampRotation(findLineRotation(layer) - layer.rotation);
    }),
  );

  // TODO: Handle setting rotation for multiple layers using the theta for each layer
  const handleSetRotation = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch(
        'setLayerRotation',
        mode === 'replace'
          ? value - findLineRotation(selectedLayers[0])
          : value,
        mode,
      );
    },
    [dispatch, selectedLayers],
  );

  const handleSetStartX = useCallback(
    (value: number, mode: SetNumberMode) => {
      const selectedPointList = Object.fromEntries(
        state.selectedObjects.map((layerId) => [layerId, [0]]),
      );
      dispatch('setPointX', selectedPointList, value, mode);
    },
    [dispatch, state.selectedObjects],
  );

  const handleSetStartY = useCallback(
    (value: number, mode: SetNumberMode) => {
      const selectedPointList = Object.fromEntries(
        state.selectedObjects.map((layerId) => [layerId, [0]]),
      );
      dispatch('setPointY', selectedPointList, value, mode);
    },
    [dispatch, state.selectedObjects],
  );

  const handleSetEndX = useCallback(
    (value: number, mode: SetNumberMode) => {
      const selectedPointList = Object.fromEntries(
        state.selectedObjects.map((layerId) => [layerId, [1]]),
      );
      dispatch('setPointX', selectedPointList, value, mode);
    },
    [dispatch, state.selectedObjects],
  );

  const handleSetEndY = useCallback(
    (value: number, mode: SetNumberMode) => {
      const selectedPointList = Object.fromEntries(
        state.selectedObjects.map((layerId) => [layerId, [1]]),
      );
      dispatch('setPointY', selectedPointList, value, mode);
    },
    [dispatch, state.selectedObjects],
  );

  return (
    <>
      <Row>
        <LabelContainer>Start</LabelContainer>
        <Spacer.Horizontal size={16} />
        <CoordinatesInspector
          x={startX}
          y={startY}
          onSetX={handleSetStartX}
          onSetY={handleSetStartY}
        />
      </Row>
      <Spacer.Vertical size={10} />
      <Row>
        <LabelContainer>End</LabelContainer>
        <Spacer.Horizontal size={16} />
        <CoordinatesInspector
          x={endX}
          y={endY}
          onSetX={handleSetEndX}
          onSetY={handleSetEndY}
        />
      </Row>
      <Spacer.Vertical size={10} />
      <Row>
        <DimensionInput value={width} onSetValue={onSetWidth} label="↔" />
        <Spacer.Horizontal size={16} />
        <DimensionInput
          value={rotation}
          onSetValue={handleSetRotation}
          label="°"
        />
        <Spacer.Horizontal size={16} />
        <FlipControls
          isFlippedVertical={isFlippedVertical}
          isFlippedHorizontal={isFlippedHorizontal}
          onSetIsFlippedVertical={onSetIsFlippedVertical}
          onSetIsFlippedHorizontal={onSetIsFlippedHorizontal}
        />
      </Row>
    </>
  );
}
