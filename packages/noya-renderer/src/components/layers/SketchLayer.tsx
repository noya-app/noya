import { PageLayer } from 'noya-state';
import { memo } from 'react';
import SketchArtboard from './SketchArtboard';
import SketchBitmap from './SketchBitmap';
import SketchGroup from './SketchGroup';
import SketchShape from './SketchShape';
import SketchText from './SketchText';

interface Props {
  layer: PageLayer;
}

export default memo(function SketchLayer({ layer }: Props) {
  switch (layer._class) {
    case 'artboard':
      return <SketchArtboard layer={layer} />;
    case 'group':
      return <SketchGroup layer={layer} />;
    case 'text':
      return <SketchText layer={layer} />;
    case 'bitmap':
      return <SketchBitmap layer={layer} />;
    case 'rectangle':
    case 'oval':
      return <SketchShape layer={layer} />;
    default:
      console.log(layer._class, 'not handled');
      return null;
  }
});
