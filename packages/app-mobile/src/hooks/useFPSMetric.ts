import { useEffect, useState } from 'react';

type FrameData = {
  fps: number;
  lastStamp: number;
  framesCount: number;
  average: number;
  totalCount: number;
};
export type FPS = { average: FrameData['average']; fps: FrameData['fps'] };

export function useFPSMetric(): FPS {
  const [frameState, setFrameState] = useState<FrameData>({
    fps: 0,
    lastStamp: Date.now(),
    framesCount: 0,
    average: 0,
    totalCount: 0,
  });

  useEffect(() => {
    // NOTE: timeout is here
    // because requestAnimationFrame is deferred
    // and to prevent setStates when unmounted
    let timeout: NodeJS.Timeout | null = null;

    requestAnimationFrame((): void => {
      timeout = setTimeout((): void => {
        const currentStamp = Date.now();
        const shouldSetState = currentStamp - frameState.lastStamp > 1000;

        const newFramesCount = frameState.framesCount + 1;
        // updates fps at most once per second
        if (shouldSetState) {
          const newValue = frameState.framesCount;
          const totalCount = frameState.totalCount + 1;
          // I use math.min here because values over 60 aren't really important
          // I calculate the mean fps incrementatally here instead of storing all the values
          const newMean = Math.min(
            frameState.average + (newValue - frameState.average) / totalCount,
            60,
          );
          setFrameState({
            fps: frameState.framesCount,
            lastStamp: currentStamp,
            framesCount: 0,
            average: newMean,
            totalCount,
          });
        } else {
          setFrameState({
            ...frameState,
            framesCount: newFramesCount,
          });
        }
      }, 0);
    });
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [frameState]);

  return { average: frameState.average, fps: frameState.fps };
}
