import { Paint } from 'canvaskit';
import Sketch from 'noya-file-format';
import { AffineTransform } from 'noya-geometry';
import { measureLayout, YogaNode } from 'noya-layout';
import { useStroke } from 'noya-react-canvaskit';
import { getSourceFileForId, Layers, Selectors } from 'noya-state';
import {
  ElementLayer,
  getComponentLayer,
  useTypescriptCompiler,
} from 'noya-typescript';
import { isShallowEqual } from 'noya-utils';
import { memo, ReactNode, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Group, Path, Rect } from '..';
import { useCanvasKit } from '../hooks/useCanvasKit';
import useLayerFrameRect from '../hooks/useLayerFrameRect';
import useLayerPath from '../hooks/useLayerPath';
import { useZoom } from '../ZoomContext';
import { elementLayerToLayoutNode } from './layers/SketchComponent';

interface HoverOutlinePathProps {
  layer: Layers.PointsLayer | Sketch.ShapeGroup;
  paint: Paint;
}

function HoverOutlinePath({ layer, paint }: HoverOutlinePathProps) {
  return <Path path={useLayerPath(layer)} paint={paint} />;
}

interface HoverOutlineRectProps {
  layer: Sketch.AnyLayer;
  paint: Paint;
}

function HoverOutlineRect({ layer, paint }: HoverOutlineRectProps) {
  return <Rect rect={useLayerFrameRect(layer)} paint={paint} />;
}

const MeasuredElement = memo(function MeasuredElement({
  elementLayer,
  measuredLayout,
  paint,
  selectedIndexPath,
}: {
  elementLayer: ElementLayer;
  measuredLayout: YogaNode;
  paint: Paint;
  selectedIndexPath: number[];
}) {
  const CanvasKit = useCanvasKit();
  const left = measuredLayout.getComputedLeft();
  const top = measuredLayout.getComputedTop();
  const width = measuredLayout.getComputedWidth();
  const height = measuredLayout.getComputedHeight();

  return (
    <Group transform={AffineTransform.translate(left, top)}>
      {isShallowEqual(elementLayer.indexPath, selectedIndexPath) && (
        <Rect paint={paint} rect={CanvasKit.XYWHRect(0, 0, width, height)} />
      )}
      {elementLayer.children.map((child, index) => (
        <MeasuredElement
          key={index}
          elementLayer={child}
          measuredLayout={measuredLayout.getChild(index)}
          selectedIndexPath={selectedIndexPath}
          paint={paint}
        />
      ))}
    </Group>
  );
});

interface Props {
  layer: Sketch.AnyLayer;
  transform: AffineTransform;
  elementIndexPath?: number[];
}

export default function HoverOutline({
  layer,
  transform,
  elementIndexPath,
}: Props) {
  const compiler = useTypescriptCompiler();
  const CanvasKit = useCanvasKit();
  const zoom = useZoom();

  const color = useTheme().colors.primary;
  const paint = useStroke({
    color: CanvasKit.parseColorString(color),
    strokeWidth: 2 / zoom,
  });

  let localTransform = useMemo(
    () =>
      AffineTransform.multiply(
        transform,
        Selectors.getLayerFlipTransform(layer),
        Selectors.getLayerRotationTransform(layer),
      ),
    [layer, transform],
  );

  let element: ReactNode;

  switch (layer._class) {
    case 'artboard':
    case 'bitmap':
    case 'group':
    case 'text':
    case 'slice':
    case 'symbolInstance':
    case 'symbolMaster': {
      element = <HoverOutlineRect layer={layer} paint={paint} />;
      break;
    }
    case 'componentContainer': {
      if (elementIndexPath) {
        const sourceFile = getSourceFileForId(
          compiler.environment,
          layer.do_objectID,
        );

        if (!sourceFile) break;

        const componentLayer = getComponentLayer(sourceFile);

        if (!componentLayer) break;

        const layoutNode = elementLayerToLayoutNode(componentLayer.element);

        const measuredLayout = measureLayout(layoutNode, layer.frame);

        element = (
          <Group
            transform={AffineTransform.translate(layer.frame.x, layer.frame.y)}
          >
            <MeasuredElement
              measuredLayout={measuredLayout}
              elementLayer={componentLayer.element}
              paint={paint}
              selectedIndexPath={elementIndexPath}
            />
          </Group>
        );

        break;
      }

      element = <HoverOutlineRect layer={layer} paint={paint} />;
      break;
    }
    case 'triangle':
    case 'star':
    case 'polygon':
    case 'shapePath':
    case 'rectangle':
    case 'oval':
    case 'shapeGroup': {
      element = <HoverOutlinePath layer={layer} paint={paint} />;
      break;
    }
    default:
      console.info(layer._class, 'not handled');
      element = null;
      break;
  }

  return <Group transform={localTransform}>{element}</Group>;
}
