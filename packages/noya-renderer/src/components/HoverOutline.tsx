import React, { ReactNode, useMemo } from 'react';

import { Paint } from 'canvaskit';
import Sketch from 'noya-file-format';
import { AffineTransform } from 'noya-geometry';
import { Layers, Selectors } from 'noya-state';
import { useStroke } from 'noya-react-canvaskit';
import { Group, Path, Rect } from '../contexts/ComponentsContext';
import { useZoom } from '../contexts/ZoomContext';
import useLayerFrameRect from '../hooks/useLayerFrameRect';
import { useCanvasKit } from '../hooks/useCanvasKit';
import useLayerPath from '../hooks/useLayerPath';

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
}

export default function HoverOutline({ layer, transform }: Props) {
  const CanvasKit = useCanvasKit();
  const zoom = useZoom();

  const paint = useStroke({
    color: CanvasKit.Color(132, 63, 255, 1),
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
