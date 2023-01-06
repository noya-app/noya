import { useApplicationState } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import { AffineTransform, transformRect } from 'noya-geometry';
import { Selectors } from 'noya-state';

export function useWidget({ layer }: { layer: Sketch.AnyLayer }) {
  const [state] = useApplicationState();
  const meta = Selectors.getCurrentPageMetadata(state);
  const { zoomValue, scrollOrigin } = meta;

  const screenTransform = AffineTransform.scale(1 / zoomValue)
    .translate(-scrollOrigin.x, -scrollOrigin.y)
    .invert();

  const frame = transformRect(layer.frame, screenTransform);

  return { frame };
}
