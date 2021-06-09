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

const POINT_RADIUS = 4;

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
        point.x - POINT_RADIUS,
        point.y - POINT_RADIUS,
        POINT_RADIUS * 2,
        POINT_RADIUS * 2,
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

  const points = layer.points.map(
    (point) => Primitives.decodeCurvePoint(point, layer.frame).point,
  );

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
    </Group>
  );
}
