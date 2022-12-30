import Sketch from 'noya-file-format';
import { AffineTransform } from 'noya-geometry';
import { PageLayer, Selectors } from 'noya-state';
import React, { memo } from 'react';
import { useIsLayerClipped } from '../../ClippedLayerContext';
import { Group } from '../../ComponentsContext';
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
  const isClipped = useIsLayerClipped(layer.do_objectID);

  if (isClipped || !layer.isVisible) return null;

  let element: JSX.Element;

  switch (layer._class) {
    case 'artboard':
      element = (
        <SketchArtboard
          SketchLayer={SketchLayer}
          layer={layer}
          isSymbolMaster={false}
        />
      );
      break;
    case 'symbolMaster':
      element = (
        <SketchArtboard
          SketchLayer={SketchLayer}
          layer={layer}
          isSymbolMaster={true}
        />
      );
      break;
    case 'page':
    case 'group':
      element = <SketchGroup SketchLayer={SketchLayer} layer={layer} />;
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
      element = (
        <SketchSymbolInstance SketchLayer={SketchLayer} layer={layer} />
      );
      break;
    case 'slice':
      element = <SketchSlice layer={layer} />;
      break;
    default:
      console.info(layer._class, 'not handled');
      element = <></>;
  }

  const transforms: AffineTransform[] = [];

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
