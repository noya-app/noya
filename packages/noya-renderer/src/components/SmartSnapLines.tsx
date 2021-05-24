import { createBounds, Rect } from 'noya-geometry';
import { Polyline, usePaint, useReactCanvasKit } from 'noya-react-canvaskit';

export default function SmartSnapLines({
  selectedBounds,
  visibleBounds,
  selectedRect,
  highlightedRect,
}: {
  selectedBounds: number;
  visibleBounds: number;
  selectedRect: Rect;
  highlightedRect: Rect;
}) {
  const highlightedBoundsRect = createBounds(highlightedRect);
  const selectedBoundsRect = createBounds(selectedRect);

  const { CanvasKit } = useReactCanvasKit();

  const measurementGuidePaint = usePaint({
    color: CanvasKit.Color4f(0.0, 0.2, 1.0),
    strokeWidth: 1,
    style: CanvasKit.PaintStyle.Stroke,
  });

  const points = [
    { x: selectedBoundsRect.minX, y: selectedBounds },
    { x: highlightedBoundsRect.maxX, y: visibleBounds },
  ];

  return (
    <>
      <Polyline paint={measurementGuidePaint} points={points} />
    </>
  );
}
