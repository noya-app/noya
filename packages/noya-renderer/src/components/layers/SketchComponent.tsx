import Sketch from 'noya-file-format';
import { ClipProps, usePaint } from 'noya-react-canvaskit';
import { Group, Rect as RCKRect, useCanvasKit } from 'noya-renderer';
import { Primitives } from 'noya-state';
import { memo, useMemo } from 'react';
import { useRenderingMode } from '../../RenderingModeContext';
import { ArtboardBlur, ArtboardLabel } from './SketchArtboard';

interface SketchComponentContentProps {
  layer: Sketch.ComponentContainer;
}

export const SketchComponentContent = memo(function SketchComponentContent({
  layer,
}: SketchComponentContentProps) {
  const CanvasKit = useCanvasKit();

  const paint = usePaint({
    color: layer.hasBackgroundColor
      ? Primitives.color(CanvasKit, layer.backgroundColor)
      : CanvasKit.WHITE,
    style: CanvasKit.PaintStyle.Fill,
  });

  const rect = Primitives.rect(CanvasKit, layer.frame);

  const clip: ClipProps = useMemo(
    () => ({
      path: rect,
      op: CanvasKit.ClipOp.Intersect,
    }),
    [CanvasKit.ClipOp.Intersect, rect],
  );

  const renderingMode = useRenderingMode();
  const showBackground =
    renderingMode === 'interactive' ||
    (layer.hasBackgroundColor && layer.includeBackgroundColorInExport);

  return (
    <>
      {showBackground && <RCKRect rect={rect} paint={paint} />}
      <Group clip={clip}>{/* <SketchGroup layer={layer} /> */}</Group>
    </>
  );
});

interface Props {
  layer: Sketch.ComponentContainer;
}

export default memo(function SketchComponent({ layer }: Props) {
  const renderingMode = useRenderingMode();

  return (
    <>
      {renderingMode === 'interactive' && (
        <>
          <ArtboardLabel
            text={layer.name}
            layerFrame={layer.frame}
            isSymbolMaster={true}
          />
          <ArtboardBlur layerFrame={layer.frame} />
        </>
      )}
      <SketchComponentContent layer={layer} />
    </>
  );
});
