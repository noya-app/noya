import Sketch from 'noya-file-format';
import { AffineTransform } from 'noya-geometry';
import {
  createLayoutNode,
  Edge,
  FlexDirection,
  LayoutNode,
  LayoutProperties,
  measureLayout,
  YogaNode,
} from 'noya-layout';
import { ClipProps, useColorFill, usePaint } from 'noya-react-canvaskit';
import { Group, Rect as RCKRect, Rect, useCanvasKit } from 'noya-renderer';
import {
  ElementFlexDirection,
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
    elementLayer.attributes.background &&
      elementLayer.attributes.background.type === 'stringLiteral'
      ? elementLayer.attributes.background.value
      : 'rgba(0,0,0,0)',
  );

  const left = measuredLayout.getComputedLeft();
  const top = measuredLayout.getComputedTop();
  const width = measuredLayout.getComputedWidth();
  const height = measuredLayout.getComputedHeight();

  return (
    <Group transform={AffineTransform.translate(left, top)}>
      <Rect paint={paint} rect={CanvasKit.XYWHRect(0, 0, width, height)} />
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

export function elementLayerToLayoutNode(
  elementLayer: ElementLayer,
): LayoutNode {
  const flexDirection =
    getAttributeValue<ElementFlexDirection>(
      elementLayer.attributes,
      'flexDirection',
    ) ?? 'column';

  const flexBasis =
    getAttributeValue(elementLayer.attributes, 'flexBasis') ?? 0;
  const flexGrow =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'flexGrow')) ?? 1;
  const flexShrink =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'flexShrink')) ?? 1;
  const paddingTop =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'paddingTop')) ?? 0;
  const paddingRight =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'paddingRight')) ??
    0;
  const paddingBottom =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'paddingBottom')) ??
    0;
  const paddingLeft =
    parseIntSafe(getAttributeValue(elementLayer.attributes, 'paddingLeft')) ??
    0;

  const properties: LayoutProperties = {
    flexDirection: FlexDirection[flexDirection],
    flexBasis,
    flexGrow,
    flexShrink,
    padding: {
      [Edge.top]: paddingTop,
      [Edge.right]: paddingRight,
      [Edge.bottom]: paddingBottom,
      [Edge.left]: paddingLeft,
    },
  };

  return createLayoutNode(
    properties,
    elementLayer.children.map(elementLayerToLayoutNode),
  );
}
