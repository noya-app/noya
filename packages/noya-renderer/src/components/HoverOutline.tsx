import { Paint } from 'canvaskit';
import Sketch from 'noya-file-format';
import { AffineTransform } from 'noya-geometry';
import { measureLayout } from 'noya-layout';
import { useStroke } from 'noya-react-canvaskit';
import {
  elementLayerToLayoutNode,
  getSourceFileForId,
  Layers,
  Selectors,
} from 'noya-state';
import { getComponentLayer, useTypescriptCompiler } from 'noya-typescript';
import { isShallowEqual } from 'noya-utils';
import { ReactNode, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Group, Path, Rect } from '..';
import { useCanvasKit } from '../hooks/useCanvasKit';
import useLayerFrameRect from '../hooks/useLayerFrameRect';
import useLayerPath from '../hooks/useLayerPath';
import { useZoom } from '../ZoomContext';

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

        const rect = Selectors.findInElementLayer(
          layer.frame,
          componentLayer.element,
          measuredLayout,
          (elementLayer, rect) =>
            isShallowEqual(elementLayer.indexPath, elementIndexPath)
              ? rect
              : undefined,
        );

        if (!rect) break;

        element = (
          <Rect
            paint={paint}
            rect={CanvasKit.XYWHRect(rect.x, rect.y, rect.width, rect.height)}
          />
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
