import { useSelector } from 'noya-app-state-context';
import { Spacer } from 'noya-designsystem';
import {
  clampRotation,
  decodeCurvePoint,
  isPointsLayer,
  Point,
  Selectors,
  SetNumberMode,
} from 'noya-state';
import { useCallback } from 'react';
import styled from 'styled-components';
import LinePointCoordinatesInspector from '../../containers/LinePointCoordinatesInspector';
import useShallowArray from '../../hooks/useShallowArray';
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

const LinePointCoordinatesContainer = styled.div(({ theme }) => ({
  width: '200px',
}));

function roundNumber(number: number, roundTo: number) {
  return Number(number.toFixed(roundTo));
}

export interface Props {
  width: DimensionValue;
  isFlippedVertical: boolean;
  isFlippedHorizontal: boolean;
  rotation: DimensionValue;
  hasLineLayer: boolean;
  onSetWidth: (value: number, mode: SetNumberMode) => void;
  onSetHeight: (value: number, mode: SetNumberMode) => void;
  onSetRotation: (value: number, mode: SetNumberMode) => void;
  onSetIsFlippedVertical: (value: boolean) => void;
  onSetIsFlippedHorizontal: (value: boolean) => void;
}

export default function LineInspector({
  width,
  rotation,
  isFlippedVertical,
  isFlippedHorizontal,
  hasLineLayer,
  onSetWidth,
  onSetRotation,
  onSetIsFlippedVertical,
  onSetIsFlippedHorizontal,
}: Props) {
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

  const findLineRotation = useCallback(() => {
    let lineRotation = undefined;

    if (startPoint && endPoint) {
      let theta = Math.atan2(
        startPoint.y - endPoint.y,
        startPoint.x - endPoint.x,
      );
      lineRotation = clampRotation(theta * (180 / Math.PI));

      return roundNumber(lineRotation, 1);
    }
  }, [endPoint, startPoint]);

  const pointRotaion = findLineRotation();

  return (
    <>
      {hasLineLayer && (
        <>
          <Row>
            Start
            <Spacer.Horizontal size={20} />
            <LinePointCoordinatesContainer>
              <LinePointCoordinatesInspector
                point={endPoint}
                direction={'end'}
              />
            </LinePointCoordinatesContainer>
          </Row>
          <Spacer.Vertical size={10} />
          <Row>
            End
            <Spacer.Horizontal size={20} />
            <LinePointCoordinatesContainer>
              <LinePointCoordinatesInspector
                point={startPoint}
                direction={'start'}
              />
            </LinePointCoordinatesContainer>
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
              value={rotation ? rotation : pointRotaion}
              onSetValue={onSetRotation}
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
      )}
    </>
  );
}
