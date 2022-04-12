import { useCallback, useRef } from 'react';

import { useApplicationState, useSelector } from 'noya-app-state-context';
import { PinchUpdateEvent } from 'noya-designsystem';
import { Selectors } from 'noya-state';

export default function useCanvasPinchEvents() {
  const [, dispatch] = useApplicationState();
  const meta = useSelector(Selectors.getCurrentPageMetadata);

  const initialZoom = useRef<number>(1);

  const onStart = useCallback(() => {
    initialZoom.current = meta.zoomValue;
  }, [meta]);

  const onUpdate = useCallback(
    (event: PinchUpdateEvent) => {
      const scale = initialZoom.current * event.scale;

      dispatch(
        'setZoomRelative*',
        {
          scale,
          scaleTo: {
            x: event.focalX,
            y: event.focalY,
          },
        },
        'replace',
      );
    },
    [dispatch],
  );

  const onEnd = useCallback(() => {
    initialZoom.current = 1;
  }, []);

  return { onStart, onUpdate, onEnd };
}
