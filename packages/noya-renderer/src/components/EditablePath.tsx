import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Paint } from 'canvaskit';
import { AffineTransform, Point } from 'noya-geometry';
import {
  Group,
  Path,
  Polyline,
  Rect,
  useDeletable,
  useFill,
  useReactCanvasKit,
  useStroke,
} from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { Layers, Selectors } from 'noya-state';
import React, { Fragment, useMemo } from 'react';
import { useTheme } from 'styled-components';

const POINT_SIZE = 8;

interface EditablePathPointProps {
  point: Point;
  fill: Paint;
  stroke: Paint;
}

function EditablePathPoint({ point, fill, stroke }: EditablePathPointProps) {
  const { CanvasKit } = useReactCanvasKit();

  const path = useMemo(() => {
    const path = new CanvasKit.Path();

    path.addOval(
      CanvasKit.XYWHRect(
        point.x - POINT_SIZE / 2,
        point.y - POINT_SIZE / 2,
        POINT_SIZE,
        POINT_SIZE,
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
  const { CanvasKit } = useReactCanvasKit();

  const rect = Primitives.rect(CanvasKit, {
    x: point.x - POINT_SIZE / 2 + 2,
    y: point.y - POINT_SIZE / 2 + 2,
    width: POINT_SIZE / 2,
    height: POINT_SIZE / 2,
  });

  return <Rect rect={rect} paint={fill}></Rect>;
}

interface Props {
  layer: Sketch.AnyLayer;
  transform: AffineTransform;
  selectedIndexes: number[];
}

export default function EditablePath({
  layer,
  transform,
  selectedIndexes,
}: Props) {
  const { CanvasKit } = useReactCanvasKit();
  const {
    canvas: { dragHandleStroke },
    primary,
  } = useTheme().colors;

  let localTransform = useMemo(
    () =>
      AffineTransform.multiply(
        transform,
        Selectors.getLayerRotationTransform(layer),
      ),
    [layer, transform],
  );

  const fill = useFill({ color: CanvasKit.WHITE });
  const stroke = useStroke({ color: dragHandleStroke });

  const selectedFill = useFill({ color: primary });
  const selectedStroke = useStroke({ color: CanvasKit.WHITE });

  if (!Layers.isPointsLayer(layer)) return null;

  const parsedCurvePoints = layer.points.map((point) =>
    Primitives.parseCurvePoint(point, layer.frame),
  );

  const points = parsedCurvePoints.map((point) => point.point);
  const controlPoints = parsedCurvePoints.filter(
    (point) => point.curveMode !== 1,
  );

  return (
    <Group transform={localTransform}>
      <Polyline points={points} paint={stroke} />

      {controlPoints.map((point, index) => {
        const points = [point.point, point.curveFrom];
        return (
          <Fragment key={index}>
            <Polyline points={points} paint={stroke} />
            <EditablePathControlPoint point={point.curveFrom} fill={fill} />
          </Fragment>
        );
      })}

      {controlPoints.map((point, index) => {
        const points = [point.point, point.curveTo];
        return (
          <Fragment key={index}>
            <Polyline points={points} paint={stroke} />
            <EditablePathControlPoint point={point.curveTo} fill={fill} />
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
