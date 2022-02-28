import React, { Fragment, useMemo } from 'react';
import { useTheme } from 'styled-components';

import Sketch from 'noya-file-format';
import { Paint } from 'canvaskit-types';
import { AffineTransform, Point } from 'noya-geometry';
import { useDeletable, useFill, useStroke } from 'noya-react-canvaskit';
import {
  Layers,
  SelectedControlPoint,
  Selectors,
  Primitives,
} from 'noya-state';
import { Group, Path, Polyline, Rect } from '../contexts/ComponentsContext';
import { useCanvasKit } from '../hooks/useCanvasKit';

const CONTROL_POINT_SIZE = 2;

interface EditablePathPointProps {
  point: Point;
  fill: Paint;
  stroke: Paint;
}

export function EditablePathPoint({
  point,
  fill,
  stroke,
}: EditablePathPointProps) {
  const CanvasKit = useCanvasKit();

  const path = useMemo(() => {
    const path = new CanvasKit.Path();

    path.addOval(
      CanvasKit.XYWHRect(
        point.x - Selectors.POINT_RADIUS,
        point.y - Selectors.POINT_RADIUS,
        Selectors.POINT_RADIUS * 2,
        Selectors.POINT_RADIUS * 2,
      ),
    );

    return path;
  }, [CanvasKit, point.x, point.y]);

  useDeletable(path);

  return (
    <>
      <Path path={path} paint={fill} />
      <Path path={path} paint={stroke} />
    </>
  );
}

interface EditablePathControlPointProps {
  point: Point;
  fill: Paint;
}

function EditablePathControlPoint({
  point,
  fill,
}: EditablePathControlPointProps) {
  const CanvasKit = useCanvasKit();

  const rect = Primitives.rect(CanvasKit, {
    x: point.x - CONTROL_POINT_SIZE,
    y: point.y - CONTROL_POINT_SIZE,
    width: CONTROL_POINT_SIZE * 2,
    height: CONTROL_POINT_SIZE * 2,
  });

  return <Rect rect={rect} paint={fill} />;
}

interface EditablePathOutlineProps {
  layer: Layers.PointsLayer;
  stroke: Paint;
}

function EditablePathOutline({ layer, stroke }: EditablePathOutlineProps) {
  const CanvasKit = useCanvasKit();

  const path = useMemo(() => {
    const path = Primitives.path(
      CanvasKit,
      layer.points,
      layer.frame,
      layer.isClosed,
    );

    path.setFillType(CanvasKit.FillType.EvenOdd);

    return path;
  }, [CanvasKit, layer.frame, layer.isClosed, layer.points]);

  return <Path path={path} paint={stroke} />;
}

interface Props {
  layer: Sketch.AnyLayer;
  transform: AffineTransform;
  selectedIndexes: number[];
  selectedControlPoint?: SelectedControlPoint;
}

export default function EditablePath({
  layer,
  transform,
  selectedIndexes,
  selectedControlPoint,
}: Props) {
  const CanvasKit = useCanvasKit();
  const {
    canvas: { dragHandleStroke },
    primary,
  } = useTheme().colors;

  let localTransform = useMemo(
    () =>
      AffineTransform.multiply(
        transform,
        Selectors.getLayerFlipTransform(layer),
        Selectors.getLayerRotationTransform(layer),
      ),
    [layer, transform],
  );

  const fill = useFill({ color: CanvasKit.WHITE });
  const stroke = useStroke({ color: dragHandleStroke });

  const selectedFill = useFill({ color: primary });
  const selectedStroke = useStroke({ color: CanvasKit.WHITE });

  if (!Layers.isPointsLayer(layer)) return null;

  const decodeCurvePoints = layer.points.map((point) =>
    Primitives.decodeCurvePoint(point, layer.frame),
  );

  const points = decodeCurvePoints.map((point) => point.point);

  return (
    <Group transform={localTransform}>
      <EditablePathOutline layer={layer} stroke={stroke} />
      {decodeCurvePoints.map((point, index) => {
        if (point.curveMode === Sketch.CurveMode.Straight) return null;
        const points = [point.point, point.curveFrom];
        const isSelected =
          selectedControlPoint?.pointIndex === index &&
          selectedControlPoint.controlPointType === 'curveFrom';
        return (
          <Fragment key={index}>
            <Polyline points={points} paint={stroke} />
            <EditablePathControlPoint
              point={point.curveFrom}
              fill={isSelected ? selectedFill : fill}
            />
          </Fragment>
        );
      })}
      {decodeCurvePoints.map((point, index) => {
        if (point.curveMode === Sketch.CurveMode.Straight) return null;
        const points = [point.point, point.curveTo];
        const isSelected =
          selectedControlPoint?.pointIndex === index &&
          selectedControlPoint.controlPointType === 'curveTo';
        return (
          <Fragment key={index}>
            <Polyline points={points} paint={stroke} />
            <EditablePathControlPoint
              point={point.curveTo}
              fill={isSelected ? selectedFill : fill}
            />
          </Fragment>
        );
      })}
      {points.map((point, index) => {
        const isSelected = selectedIndexes.includes(index);

        return (
          <EditablePathPoint
            key={index}
            point={point}
            fill={isSelected ? selectedFill : fill}
            stroke={isSelected ? selectedStroke : stroke}
          />
        );
      })}
    </Group>
  );
}
