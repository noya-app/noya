import { createBounds } from 'noya-geometry';
import { Polyline, usePaint, useReactCanvasKit } from 'noya-react-canvaskit';

export default function SmartSnapLines({
  matches,
  pointsToUse,
}: {
  matches: any[];
  pointsToUse?: string;
}) {
  const { CanvasKit } = useReactCanvasKit();

  const measurementGuidePaint = usePaint({
    color: CanvasKit.Color4f(0.0, 0.2, 1.0),
    strokeWidth: 1,
    style: CanvasKit.PaintStyle.Stroke,
  });

  function getPointsY(match: any) {
    const highlightedBoundsRect = createBounds(match.layerToSnapBoundingRect);
    const selectedBoundsRect = createBounds(match.selectedRect);
    return [
      { x: selectedBoundsRect.minX, y: match.setSelectedBounds },
      { x: highlightedBoundsRect.maxX, y: match.setSelectedBounds },
    ];
  }

  function getPointsX(match: any) {
    const highlightedBoundsRect = createBounds(match.layerToSnapBoundingRect);
    const selectedBoundsRect = createBounds(match.selectedRect);
    return [
      { x: match.setSelectedBounds, y: selectedBoundsRect.minY },
      { x: match.setSelectedBounds, y: highlightedBoundsRect.maxY },
    ];
  }
  return (
    <>
      {matches.map((match, index) => {
        return (
          <Polyline
            paint={measurementGuidePaint}
            points={pointsToUse ? getPointsY(match) : getPointsX(match)}
            key={index}
          />
        );
      })}
    </>
  );
}
