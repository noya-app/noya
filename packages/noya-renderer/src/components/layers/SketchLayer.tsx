import { PageLayer, Selectors } from 'noya-state';
import { memo } from 'react';
import { AffineTransform, createBounds } from 'noya-geometry';
import SketchArtboard from './SketchArtboard';
import SketchBitmap from './SketchBitmap';
import SketchGroup from './SketchGroup';
import SketchShape from './SketchShape';
import SketchSymbolInstance from './SketchSymbolInstance';
import SketchText from './SketchText';
import { Group } from '../..';
import SketchShapeGroup from './SketchShapeGroup';

interface Props {
  layer: PageLayer;
}

export default memo(function SketchLayer({ layer }: Props) {
  if (!layer.isVisible) return null;

  let element: JSX.Element;

  switch (layer._class) {
    case 'artboard':
      element = <SketchArtboard layer={layer} isSymbolMaster={false} />;
      break;
    case 'symbolMaster':
      element = <SketchArtboard layer={layer} isSymbolMaster={true} />;
      break;
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
      element = <SketchShape layer={layer} />;
      break;
    case 'shapeGroup':
      element = <SketchShapeGroup layer={layer} />;
      break;
    case 'symbolInstance':
      element = <SketchSymbolInstance layer={layer} />;
      break;
    default:
      console.info(layer._class, 'not handled');
      element = <></>;
  }

  let transforms: AffineTransform[] = [];

  if (layer.isFlippedHorizontal || layer.isFlippedVertical) {
    const bounds = createBounds(layer.frame);

    transforms.push(
      AffineTransform.multiply(
        AffineTransform.translation(bounds.midX, bounds.midY),
        AffineTransform.scale(
          layer.isFlippedHorizontal ? -1 : 1,
          layer.isFlippedVertical ? -1 : 1,
        ),
        AffineTransform.translation(-bounds.midX, -bounds.midY),
      ),
    );
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
