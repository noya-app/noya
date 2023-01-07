import { distance, Point } from 'noya-geometry';
import { useCallback, useRef } from 'react';

export function useMultipleClickCount() {
  const lastClick = useRef<
    | {
        timestamp: number;
        point: Point;
        clickCount: number;
      }
    | undefined
  >();

  const setLatestClick = useCallback(
    (point: Point) => {
      const timestamp = Date.now();
      const clickCount =
        lastClick.current &&
        distance(lastClick.current.point, point) < 5 &&
        timestamp - lastClick.current.timestamp < 300
          ? lastClick.current.clickCount + 1
          : 1;

      lastClick.current = { point, timestamp, clickCount };

      return clickCount;
    },
    [lastClick],
  );

  const getClickCount = useCallback(() => {
    return lastClick.current ? lastClick.current.clickCount : 1;
  }, [lastClick]);

  return {
    getClickCount,
    setLatestClick,
  };
}
