// eslint-disable-next-line no-restricted-imports
import { useSelector } from 'noya-app-state-context/src/ApplicationStateContext';
import { Button, Spacer } from 'noya-designsystem';
import { decodeCurvePoint, Point, Selectors, SetNumberMode } from 'noya-state';
// eslint-disable-next-line no-restricted-imports
import { isPointsLayer } from 'noya-state/src/layers';
import { useCallback, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import LinePointCoordinatesInspector from '../../containers/LinePointCoordinatesInspector';
import useShallowArray from '../../hooks/useShallowArray';
import FlipHorizontalIcon from '../icons/FlipHorizontalIcon';
import FlipVerticalIcon from '../icons/FlipVerticalIcon';
import DimensionInput from './DimensionInput';

export type DimensionValue = number | undefined;

const Row = styled.div(({ theme }) => ({
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'row',
  paddingLeft: '10px',
  paddingRight: '10px',
}));

const FlipButtonContainer = styled.div(({ theme }) => ({
  flex: '1',
  display: 'flex',
  flexDirection: 'row',
}));

export interface Props {
  x: DimensionValue;
  y: DimensionValue;
  width: DimensionValue;
  height: DimensionValue;
  rotation: DimensionValue;
  isFlippedVertical: boolean;
  isFlippedHorizontal: boolean;
  hasLineLayer: boolean;
  onSetX: (value: number, mode: SetNumberMode) => void;
  onSetY: (value: number, mode: SetNumberMode) => void;
  onSetWidth: (value: number, mode: SetNumberMode) => void;
  onSetHeight: (value: number, mode: SetNumberMode) => void;
  onSetRotation: (value: number, mode: SetNumberMode) => void;
  onSetIsFlippedVertical: (value: boolean) => void;
  onSetIsFlippedHorizontal: (value: boolean) => void;
}

export default function DimensionsInspector({
  x,
  y,
  width,
  height,
  rotation,
  isFlippedVertical,
  isFlippedHorizontal,
  hasLineLayer,
  onSetX,
  onSetY,
  onSetWidth,
  onSetHeight,
  onSetRotation,
  onSetIsFlippedVertical,
  onSetIsFlippedHorizontal,
}: Props) {
  const {
    icon: iconColor,
    iconSelected: iconSelectedColor,
  } = useTheme().colors;

  const handleSetIsFlippedVertical = useCallback(
    () => onSetIsFlippedVertical(!isFlippedVertical),
    [isFlippedVertical, onSetIsFlippedVertical],
  );

  const handleSetIsFlippedHorizontal = useCallback(
    () => onSetIsFlippedHorizontal(!isFlippedHorizontal),
    [isFlippedHorizontal, onSetIsFlippedHorizontal],
  );

  const flipButtonElements = useMemo(
    () => (
      <FlipButtonContainer>
        <Button
          id="flip-horizontal"
          tooltip="Flip horizontally"
          onClick={handleSetIsFlippedHorizontal}
          active={isFlippedHorizontal}
        >
          <FlipHorizontalIcon
            color={isFlippedHorizontal ? iconSelectedColor : iconColor}
          />
        </Button>
        <Spacer.Horizontal />
        <Button
          id="flip-vertical"
          tooltip="Flip vertically"
          onClick={handleSetIsFlippedVertical}
          active={isFlippedVertical}
        >
          <FlipVerticalIcon
            color={isFlippedVertical ? iconSelectedColor : iconColor}
          />
        </Button>
      </FlipButtonContainer>
    ),
    [
      handleSetIsFlippedHorizontal,
      handleSetIsFlippedVertical,
      iconColor,
      iconSelectedColor,
      isFlippedHorizontal,
      isFlippedVertical,
    ],
  );

  const selectedLayers = useShallowArray(
    useSelector(Selectors.getSelectedLayers),
  );

  const startPoint: Point | undefined =
    hasLineLayer && isPointsLayer(selectedLayers[0])
      ? decodeCurvePoint(selectedLayers[0].points[0], selectedLayers[0].frame)
          .point
      : undefined;

  const endPoint: Point | undefined =
    hasLineLayer && isPointsLayer(selectedLayers[0])
      ? decodeCurvePoint(selectedLayers[0].points[1], selectedLayers[0].frame)
          .point
      : undefined;

  return (
    <>
      {!hasLineLayer && (
        <>
          <Row>
            <DimensionInput value={x} onSetValue={onSetX} label="X" />
            <Spacer.Horizontal size={16} />
            <DimensionInput value={y} onSetValue={onSetY} label="Y" />
            <Spacer.Horizontal size={16} />
            <DimensionInput
              value={rotation}
              onSetValue={onSetRotation}
              label="°"
            />
          </Row>
          <Spacer.Vertical size={10} />
          <Row>
            <DimensionInput value={width} onSetValue={onSetWidth} label="W" />
            <Spacer.Horizontal size={16} />
            <DimensionInput value={height} onSetValue={onSetHeight} label="H" />
            <Spacer.Horizontal size={16} />
            {flipButtonElements}
          </Row>
        </>
      )}
      {hasLineLayer && (
        <>
          <Row>
            Start
            <Spacer.Horizontal size={20} />
            <LinePointCoordinatesInspector point={endPoint} />
          </Row>
          <Spacer.Vertical size={10} />
          <Row>
            End
            <Spacer.Horizontal size={20} />
            <LinePointCoordinatesInspector point={startPoint} />
          </Row>
          <Spacer.Vertical size={10} />
          <Row>
            <DimensionInput
              value={width}
              onSetValue={onSetWidth}
              label={String.fromCharCode(8596)}
            />
            <Spacer.Horizontal size={16} />
            <DimensionInput
              value={rotation}
              onSetValue={onSetRotation}
              label="°"
            />
            <Spacer.Horizontal size={16} />
            {flipButtonElements}
          </Row>
        </>
      )}
    </>
  );
}
