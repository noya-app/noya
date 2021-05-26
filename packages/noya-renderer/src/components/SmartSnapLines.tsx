import { createBounds, Rect } from 'noya-geometry';
import { Polyline, usePaint, useReactCanvasKit } from 'noya-react-canvaskit';

export default function SmartSnapLines({
  selectedBounds,
  visibleBounds,
  selectedRect,
  highlightedRect,
  pointsToUse,
}: {
  selectedBounds: number;
  visibleBounds: number;
  selectedRect: Rect;
  highlightedRect: Rect;
  pointsToUse?: string;
}) {
  const highlightedBoundsRect = createBounds(highlightedRect);
  const selectedBoundsRect = createBounds(selectedRect);

  const { CanvasKit } = useReactCanvasKit();

  const measurementGuidePaint = usePaint({
    color: CanvasKit.Color4f(0.0, 0.2, 1.0),
    strokeWidth: 1,
    style: CanvasKit.PaintStyle.Stroke,
  });

  const pointsY = [
    { x: selectedBoundsRect.minX, y: selectedBounds },
    { x: highlightedBoundsRect.maxX, y: selectedBounds },
  ];

  const pointsX = [
    { x: selectedBounds, y: selectedBoundsRect.minY },
    { x: selectedBounds, y: highlightedBoundsRect.maxY },
  ];

  return (
    <>
      <Polyline
        paint={measurementGuidePaint}
        points={pointsToUse ? pointsY : pointsX}
      />
      {/* <Polyline paint={measurementGuidePaint} points={pointsY} /> */}
    </>
  );
}
