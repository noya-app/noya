import Sketch from '@sketch-hq/sketch-file-format-ts';
import { AffineTransform } from 'noya-geometry';
import { PageLayer, Selectors } from 'noya-state';
import { memo } from 'react';
import { Group } from '../..';
import { useIsLayerVisible } from '../../VisibleLayerContext';
import SketchArtboard from './SketchArtboard';
import SketchBitmap from './SketchBitmap';
import SketchGroup from './SketchGroup';
import SketchShape from './SketchShape';
import SketchSlice from './SketchSlice';
import SketchSymbolInstance from './SketchSymbolInstance';
import SketchText from './SketchText';

interface Props {
  layer: PageLayer | Sketch.Page;
}

export default memo(function SketchLayer({ layer }: Props) {
  const isVisible = useIsLayerVisible(layer.do_objectID);

  if (!isVisible || !layer.isVisible) return null;

  let element: JSX.Element;

  switch (layer._class) {
    case 'artboard':
      element = <SketchArtboard layer={layer} isSymbolMaster={false} />;
      break;
    case 'symbolMaster':
      element = <SketchArtboard layer={layer} isSymbolMaster={true} />;
      break;
    case 'page':
    case 'group':
      element = <SketchGroup layer={layer} />;
      break;
    case 'text':
      element = <SketchText layer={layer} />;
      break;
    case 'bitmap':
      element = <SketchBitmap layer={layer} />;
      break;
    case 'rectangle':
    case 'oval':
    case 'triangle':
    case 'star':
    case 'polygon':
    case 'shapePath':
    case 'shapeGroup':
      element = <SketchShape layer={layer} />;
      break;
    case 'symbolInstance':
      element = <SketchSymbolInstance layer={layer} />;
      break;
    case 'slice':
      element = <SketchSlice layer={layer} />;
      break;
    default:
      console.info(layer._class, 'not handled');
      element = <></>;
  }

  let transforms: AffineTransform[] = [];

  if (layer.isFlippedHorizontal || layer.isFlippedVertical) {
    transforms.push(Selectors.getLayerFlipTransform(layer));
  }

  // TODO: Investigate rotation appearing incorrect in inspector, e.g. rotate the image
  // in the demo file to 45. The rotation in our inspector will be -45.
  if (layer.rotation % 360 !== 0) {
    transforms.push(Selectors.getLayerRotationTransform(layer));
  }

  return transforms.length > 0 ? (
    <Group transform={AffineTransform.multiply(...transforms)}>{element}</Group>
  ) : (
    element
  );
});
