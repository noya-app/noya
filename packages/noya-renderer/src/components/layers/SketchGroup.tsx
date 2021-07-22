import Sketch from '@sketch-hq/sketch-file-format-ts';
import { AffineTransform } from 'noya-geometry';
import { ClipProps, useDeletable } from 'noya-react-canvaskit';
import { useCanvasKit } from 'noya-renderer';
import { PageLayer, Primitives } from 'noya-state';
import { chunkBy } from 'noya-utils';
import { memo, ReactNode, useMemo } from 'react';
import { Group } from '../..';
import SketchLayer from './SketchLayer';

interface Props {
  layer: Sketch.Group | Sketch.Artboard | Sketch.SymbolMaster | Sketch.Page;
}

const SketchMask = memo(function SketchGroup({
  layer,
  maskMode,
  children,
}: {
  layer: Sketch.AnyLayer;
  children: ReactNode;
  maskMode: 'outline' | 'alpha';
}) {
  const CanvasKit = useCanvasKit();

  const maskPath = useMemo(() => {
    if (!layer || !('points' in layer)) return;

    const path = Primitives.path(
      CanvasKit,
      layer.points,
      layer.frame,
      layer.isClosed,
    );

    return path;
  }, [CanvasKit, layer]);

  const clip: ClipProps | undefined = useMemo(
    () =>
      maskPath
        ? {
            path: maskPath,
            op: CanvasKit.ClipOp.Intersect,
            antiAlias: true,
          }
        : undefined,
    [CanvasKit.ClipOp.Intersect, maskPath],
  );

  useDeletable(maskPath);

  const imageFilter = useMemo(() => {
    if (maskMode !== 'alpha' || !layer.style?.fills) return;

    const shader = Primitives.shader(
      CanvasKit,
      layer.style.fills[0],
      layer.frame,
      undefined,
    );

    if (!shader) return;

    const shaderFilter = CanvasKit.ImageFilter.MakeShader(shader);
    const originalFilter = CanvasKit.ImageFilter.MakeCompose(null, null);

    return CanvasKit.ImageFilter.MakeBlend(
      CanvasKit.BlendMode.SrcIn,
      shaderFilter,
      originalFilter,
    );
  }, [CanvasKit, layer.frame, layer.style, maskMode]);

  return (
    <Group imageFilter={imageFilter} clip={clip}>
      {children}
    </Group>
  );
});

export default memo(function SketchGroup({ layer }: Props) {
  const transform = useMemo(
    () => AffineTransform.translation(layer.frame.x, layer.frame.y),
    [layer.frame.x, layer.frame.y],
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  const layers: PageLayer[] = layer.layers;

  // We make a new rendering chain for each mask, or each layer with
  // `shouldBreakMaskChain` set to true. Masks don't apply to other masks.
  const maskChains = chunkBy(
    layers,
    (a, b) => !b.hasClippingMask && !b.shouldBreakMaskChain,
  );

  const elements = maskChains.map((chain) => {
    const hasClippingMask = chain[0].hasClippingMask;
    const hasAlphaMask = hasClippingMask && chain[0].clippingMaskMode === 1;

    const chainElements = chain
      .slice(hasAlphaMask ? 1 : 0)
      .map((child) => <SketchLayer key={child.do_objectID} layer={child} />);

    return hasClippingMask ? (
      <SketchMask
        key={chain[0].do_objectID}
        layer={chain[0]}
        maskMode={hasAlphaMask ? 'alpha' : 'outline'}
      >
        {chainElements}
      </SketchMask>
    ) : (
      chainElements
    );
  });

  return (
    <Group opacity={opacity} transform={transform}>
      {elements}
    </Group>
  );
});
