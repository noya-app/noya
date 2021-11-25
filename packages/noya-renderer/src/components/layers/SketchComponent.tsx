import Sketch from 'noya-file-format';
import { AffineTransform } from 'noya-geometry';
import {
  createLayoutNode,
  FlexDirection,
  LayoutNode,
  measureLayout,
  YogaNode,
} from 'noya-layout';
import { ClipProps, useColorFill, usePaint } from 'noya-react-canvaskit';
import { Group, Rect as RCKRect, Rect, useCanvasKit } from 'noya-renderer';
import { getSourceFileForId, Primitives } from 'noya-state';
import {
  ElementLayer,
  getComponentLayer,
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
    elementLayer.attributes.background.type === 'stringLiteral'
      ? elementLayer.attributes.background.value
      : 'rgba(0,0,0,0)',
  );

  return (
    <Group
      transform={AffineTransform.translate(
        measuredLayout.getComputedLeft(),
        measuredLayout.getComputedTop(),
      )}
    >
      <Rect
        paint={paint}
        rect={CanvasKit.XYWHRect(
          0,
          0,
          measuredLayout.getComputedWidth(),
          measuredLayout.getComputedHeight(),
        )}
      />
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

function elementLayerToLayoutNode(elementLayer: ElementLayer): LayoutNode {
  return createLayoutNode(
    {
      flexDirection: FlexDirection.column,
      flex: 1,
    },
    elementLayer.children.map(elementLayerToLayoutNode),
  );
}
