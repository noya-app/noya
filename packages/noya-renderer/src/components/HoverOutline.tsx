import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Paint } from 'canvaskit';
import { AffineTransform } from 'noya-geometry';
import { Group, Path, Rect } from 'noya-react-canvaskit';
import { Selectors } from 'noya-state';
import { ReactNode, useMemo } from 'react';
import useLayerFrameRect from '../hooks/useLayerFrameRect';
import useLayerPath from '../hooks/useLayerPath';

interface HoverOutlinePathProps {
  layer: Sketch.Rectangle | Sketch.Oval;
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
  paint: Paint;
  transform: AffineTransform;
}

export default function HoverOutline({ layer, paint, transform }: Props) {
  let localTransform = useMemo(
    () =>
      AffineTransform.multiply(
        transform,
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
    case 'symbolInstance':
    case 'symbolMaster': {
      element = <HoverOutlineRect layer={layer} paint={paint} />;
      break;
    }
    case 'rectangle':
    case 'oval': {
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
