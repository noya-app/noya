import Sketch from '@sketch-hq/sketch-file-format-ts';
import { AffineTransform } from 'noya-geometry';
import {
  ClipProps,
  Group,
  useDeletable,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import { PageLayer } from 'noya-state';
import { chunkBy } from 'noya-utils';
import { memo, ReactNode, useMemo } from 'react';
import { Primitives } from '../..';
import SketchLayer from './SketchLayer';

interface Props {
  layer: Sketch.Group | Sketch.Artboard | Sketch.SymbolMaster | Sketch.Page;
}

const SketchMask = memo(function SketchGroup({
  layer,
  children,
}: {
  layer: Sketch.AnyLayer;
  children: ReactNode;
}) {
  const { CanvasKit } = useReactCanvasKit();

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

  return <Group clip={clip}>{children}</Group>;
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
    const chainElements = chain.map((child) => (
      <SketchLayer key={child.do_objectID} layer={child} />
    ));

    return chain[0].hasClippingMask ? (
      <SketchMask key={chain[0].do_objectID} layer={chain[0]}>
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
