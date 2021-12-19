import Sketch from 'noya-file-format';
import { AffineTransform, getRectCornerPoints } from 'noya-geometry';
import { measureLayout, YogaNode } from 'noya-layout';
import {
  ClipProps,
  useColorFill,
  useDeletable,
  usePaint,
} from 'noya-react-canvaskit';
import { Group, Rect as RCKRect, Path, useCanvasKit } from 'noya-renderer';
import { PointString, SketchModel } from 'noya-sketch-model';
import {
  elementLayerToLayoutNode,
  getSourceFileForId,
  Primitives,
} from 'noya-state';
import {
  ElementLayer,
  getAttributeValue,
  getComponentLayer,
  parseIntSafe,
  useTypescriptCompiler,
} from 'noya-typescript';
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

  const transform = useMemo(
    () => AffineTransform.translate(layer.frame.x, layer.frame.y),
    [layer.frame.x, layer.frame.y],
  );

  return (
    <>
      {showBackground && <RCKRect rect={rect} paint={paint} />}
      <Group clip={clip} transform={transform}>
        <ElementTree layer={layer} />
      </Group>
    </>
  );
});

const MeasuredElement = memo(function MeasuredElement({
  elementLayer,
  measuredLayout,
}: {
  elementLayer: ElementLayer;
  measuredLayout: YogaNode;
}) {
  const CanvasKit = useCanvasKit();
  const paint = useColorFill(
    getAttributeValue(elementLayer.attributes, 'background') ?? 'rgba(0,0,0,0)',
  );
  const borderRadius =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'borderRadius')) ??
    0;

  const left = measuredLayout.getComputedLeft();
  const top = measuredLayout.getComputedTop();
  const width = measuredLayout.getComputedWidth();
  const height = measuredLayout.getComputedHeight();

  const rect = useMemo(() => ({ x: 0, y: 0, width, height }), [height, width]);
  const points = getRectCornerPoints(rect);
  const curvePoints = points.map((point) =>
    SketchModel.curvePoint({
      point: PointString.encode(Primitives.unscalePoint(point, rect)),
      cornerRadius: borderRadius,
    }),
  );

  const path = useMemo(
    () => Primitives.path(CanvasKit, curvePoints, rect, true),
    [CanvasKit, curvePoints, rect],
  );
  useDeletable(path);

  return (
    <Group transform={AffineTransform.translate(left, top)}>
      <Path path={path} paint={paint} />
      {elementLayer.children.map((child, index) => (
        <MeasuredElement
          key={index}
          elementLayer={child}
          measuredLayout={measuredLayout.getChild(index)}
        />
      ))}
    </Group>
  );
});

const ElementTree = memo(function Elements({
  layer,
}: {
  layer: Sketch.ComponentContainer;
}) {
  const compiler = useTypescriptCompiler();

  const sourceFile = getSourceFileForId(
    compiler.environment,
    layer.do_objectID,
  );

  const { elementLayer, measuredLayout } = useMemo(() => {
    if (!sourceFile) return {};

    const componentLayer = getComponentLayer(sourceFile);

    if (!componentLayer) return {};

    const layoutNode = elementLayerToLayoutNode(componentLayer.element);

    const measuredLayout = measureLayout(layoutNode, layer.frame);

    // console.log(
    //   YogaTraverse.diagram(measuredLayout, (node) =>
    //     describeValue(node.getComputedLayout()),
    //   ),
    // );

    return {
      elementLayer: componentLayer.element,
      measuredLayout,
    };
  }, [layer.frame, sourceFile]);

  // console.info(componentLayer);

  return elementLayer && measuredLayout ? (
    <MeasuredElement
      elementLayer={elementLayer}
      measuredLayout={measuredLayout}
    />
  ) : (
    <></>
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
