import React, { useCallback } from 'react';

import { useApplicationState, useSelector } from 'noya-app-state-context';
import { useShallowArray } from 'noya-react-utils';
import { Layout } from 'noya-designsystem';
import {
  Selectors,
  clampRotation,
  isPointsLayer,
  SetNumberMode,
  decodeCurvePoint,
  getMultiNumberValue,
} from 'noya-state';
import CoordinatesInspector from '../CoordinatesInspector';
import { DimensionInput, DimensionValue } from '../DimensionsInspector';
import { Primitives } from '../primitives';
import FlipControls from '../FlipControls';
import { Row, LabelContainer } from './components';

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

  const rotation = getMultiNumberValue(
    selectedLayers.map((layer) => {
      return clampRotation(Selectors.getLineRotation(layer) - layer.rotation);
    }),
  );

  // TODO: Handle setting rotation for multiple layers using the theta for each layer
  const handleSetRotation = useCallback(
    (value: number, mode: SetNumberMode) => {
      dispatch(
        'setLayerRotation',
        mode === 'replace'
          ? value - Selectors.getLineRotation(selectedLayers[0])
          : value,
        mode,
      );
    },
    [dispatch, selectedLayers],
  );

  const handleSetStartX = useCallback(
    (value: number, mode: SetNumberMode) => {
      const selectedPointList = Object.fromEntries(
        state.selectedLayerIds.map((layerId) => [layerId, [0]]),
      );
      dispatch('setPointX', selectedPointList, value, mode);
    },
    [dispatch, state.selectedLayerIds],
  );

  const handleSetStartY = useCallback(
    (value: number, mode: SetNumberMode) => {
      const selectedPointList = Object.fromEntries(
        state.selectedLayerIds.map((layerId) => [layerId, [0]]),
      );
      dispatch('setPointY', selectedPointList, value, mode);
    },
    [dispatch, state.selectedLayerIds],
  );

  const handleSetEndX = useCallback(
    (value: number, mode: SetNumberMode) => {
      const selectedPointList = Object.fromEntries(
        state.selectedLayerIds.map((layerId) => [layerId, [1]]),
      );
      dispatch('setPointX', selectedPointList, value, mode);
    },
    [dispatch, state.selectedLayerIds],
  );

  const handleSetEndY = useCallback(
    (value: number, mode: SetNumberMode) => {
      const selectedPointList = Object.fromEntries(
        state.selectedLayerIds.map((layerId) => [layerId, [1]]),
      );
      dispatch('setPointY', selectedPointList, value, mode);
    },
    [dispatch, state.selectedLayerIds],
  );

  return (
    <>
      <Row>
        <LabelContainer>Start</LabelContainer>
        <Layout.Queue size={16} />
        <CoordinatesInspector
          x={startX}
          y={startY}
          onSetX={handleSetStartX}
          onSetY={handleSetStartY}
        />
      </Row>
      <Primitives.VerticalSeparator />
      <Row>
        <LabelContainer>End</LabelContainer>
        <Layout.Queue size={16} />
        <CoordinatesInspector
          x={endX}
          y={endY}
          onSetX={handleSetEndX}
          onSetY={handleSetEndY}
        />
      </Row>
      <Primitives.VerticalSeparator />
      <Row>
        <DimensionInput value={width} onSetValue={onSetWidth} label="↔" />
        <Layout.Queue size={16} />
        <DimensionInput
          value={rotation}
          onSetValue={handleSetRotation}
          label="°"
        />
        <Layout.Queue size={16} />
        <FlipControls
          supportsFlipping
          isFlippedVertical={isFlippedVertical}
          isFlippedHorizontal={isFlippedHorizontal}
          onSetIsFlippedVertical={onSetIsFlippedVertical}
          onSetIsFlippedHorizontal={onSetIsFlippedHorizontal}
        />
      </Row>
    </>
  );
}
