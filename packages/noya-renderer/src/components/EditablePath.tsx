import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Paint } from 'canvaskit';
import { AffineTransform, Point } from 'noya-geometry';
import {
  Group,
  Path,
  Polyline,
  useDeletable,
  useFill,
  useReactCanvasKit,
  useStroke,
} from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { Layers, Selectors } from 'noya-state';
import { useMemo } from 'react';
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

interface EditableControlPointProps {
  point: Point;
  controlPoint: Point;
  fill: Paint;
  stroke: Paint;
}

function ControlPathPoint({
  point,
  controlPoint,
  fill,
  stroke,
}: EditableControlPointProps) {
  const { CanvasKit } = useReactCanvasKit();

  const path = useMemo(() => {
    const path = new CanvasKit.Path();

    path.addRect(
      CanvasKit.XYWHRect(
        controlPoint.x - POINT_SIZE / 2 + 2,
        controlPoint.y - POINT_SIZE / 2 + 2,
        POINT_SIZE / 2,
        POINT_SIZE / 2,
      ),
    );

    return path;
  }, [CanvasKit, controlPoint.x, controlPoint.y]);
  useDeletable(path);
  const points = [point, controlPoint];

  return (
    <>
      <Polyline points={points} paint={stroke} />
      <Path path={path} paint={fill} />
      <Path path={path} paint={stroke} />
    </>
  );
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

  return (
    <Group transform={localTransform}>
      <Polyline points={points} paint={stroke} />

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

      {parsedCurvePoints.map((points, index) => {
        if (points.curveMode === 1) {
          return null;
        }
        return (
          <ControlPathPoint
            key={index}
            point={points.point}
            controlPoint={points.curveFrom}
            fill={fill}
            stroke={stroke}
          />
        );
      })}

      {parsedCurvePoints.map((points, index) => {
        if (points.curveMode === 1) {
          return null;
        }
        return (
          <ControlPathPoint
            key={index}
            point={points.point}
            controlPoint={points.curveTo}
            fill={fill}
            stroke={stroke}
          />
        );
      })}
    </Group>
  );
}
