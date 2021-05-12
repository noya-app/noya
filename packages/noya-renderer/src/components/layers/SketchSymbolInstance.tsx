import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useApplicationState } from 'app/src/contexts/ApplicationStateContext';
import { AffineTransform } from 'noya-geometry';
import { Group } from 'noya-react-canvaskit';
import { Layers } from 'noya-state';
import { memo, useMemo } from 'react';
import SketchGroup from './SketchGroup';

interface Props {
  layer: Sketch.SymbolInstance;
}

const DEFAULT_FRAME = { x: 0, y: 0, width: 0, height: 0 };

export default memo(function SketchSymbolInstance({ layer }: Props) {
  const [state] = useApplicationState();

  const symbolMaster = useMemo(
    () =>
      Layers.findInArray(
        state.sketch.pages,
        (child) =>
          Layers.isSymbolMaster(child) && layer.symbolID === child.symbolID,
      ) as Sketch.SymbolMaster | undefined,
    [layer.symbolID, state.sketch.pages],
  );

  const frame = symbolMaster?.frame ?? DEFAULT_FRAME;

  const transform = useMemo(
    () =>
      AffineTransform.translation(
        layer.frame.x - frame.x,
        layer.frame.y - frame.y,
      ),
    [layer.frame, frame],
  );

  if (!symbolMaster) return null;

  return (
    <Group transform={transform}>
      <SketchGroup layer={symbolMaster} />
    </Group>
  );
});
