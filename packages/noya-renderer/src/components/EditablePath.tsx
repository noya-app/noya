import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Paint } from 'canvaskit';
import { AffineTransform, Point } from 'noya-geometry';
import {
  Group,
  Path,
  useFill,
  useReactCanvasKit,
  useStroke,
} from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { Layers, Selectors } from 'noya-state';
import { useMemo } from 'react';
import { useTheme } from 'styled-components';
import useLayerPath from '../hooks/useLayerPath';

const POINT_SIZE = 8;

interface EditablePathPointProps {
  point: Point;
  fill: Paint;
  stroke: Paint;
}

function EditablePathPoint({ point, fill, stroke }: EditablePathPointProps) {
  const { CanvasKit } = useReactCanvasKit();

  const path = new CanvasKit.Path();

  path.addOval(
    CanvasKit.XYWHRect(
      point.x - POINT_SIZE / 2,
      point.y - POINT_SIZE / 2,
      POINT_SIZE,
      POINT_SIZE,
    ),
  );

  return (
    <>
      <Path path={path} paint={fill} />
      <Path path={path} paint={stroke} />
    </>
  );
}

interface PathOutlineProps {
  layer: Layers.PointsLayer;
  paint: Paint;
}

function PathOutline({ layer, paint }: PathOutlineProps) {
  return <Path path={useLayerPath(layer)} paint={paint} />;
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

  const curvePoints = Primitives.normalizeCurvePoints(
    layer.points,
    layer.frame,
  );

  return (
    <Group transform={localTransform}>
      <PathOutline layer={layer} paint={stroke} />
      {curvePoints.map((curvePoint, index) => {
        const isSelected = selectedIndexes.includes(index);

        return (
          <EditablePathPoint
            key={index}
            point={curvePoint.point}
            fill={isSelected ? selectedFill : fill}
            stroke={isSelected ? selectedStroke : stroke}
          />
        );
      })}
    </Group>
  );
}
