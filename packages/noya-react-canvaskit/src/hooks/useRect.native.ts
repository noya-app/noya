import { useMemo } from 'react';

import { Rect } from 'canvaskit-types';
import { Rect as RNSRect } from 'noya-native-canvaskit';

export default function useRect(parameters: Rect): Rect {
  const rect = parameters as unknown as RNSRect;

  return useMemo(
    () => rect,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rect.x, rect.y, rect.width, rect.height],
  ) as unknown as Rect;
}
