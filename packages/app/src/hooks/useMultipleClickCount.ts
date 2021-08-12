import { distance, Point } from 'noya-geometry';
import { useCallback, useState } from 'react';

export function useMultipleClickCount() {
  const [lastClick, setLastClick] = useState<
    | {
        timestamp: number;
        point: Point;
        clickCount: number;
      }
    | undefined
  >();

  return useCallback(
    function setLatestClick(point: Point) {
      const timestamp = Date.now();
      const clickCount =
        lastClick &&
        distance(lastClick.point, point) < 5 &&
        timestamp - lastClick.timestamp < 300
          ? lastClick.clickCount + 1
          : 1;

      setLastClick({ point, timestamp, clickCount });

      return clickCount;
    },
    [lastClick],
  );
}
