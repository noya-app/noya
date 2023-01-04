import { useApplicationState } from 'noya-app-state-context';
import { useStroke } from 'noya-react-canvaskit';
import { Selectors } from 'noya-state';
import React, { memo, useMemo } from 'react';
import { useTheme } from 'styled-components';
import { Polyline } from '../ComponentsContext';
import { useZoom } from '../ZoomContext';

export const RotatedBoundingRect = memo(function RotatedBoundingRect({
  layerId,
}: {
  layerId: string;
}) {
  const [state] = useApplicationState();
  const {
    canvas: { dragHandleStroke },
  } = useTheme().colors;
  const zoom = useZoom();

  const paint = useStroke({
    color: dragHandleStroke,
    strokeWidth: 1 / zoom,
  });

  const page = Selectors.getCurrentPage(state);
  const boundingPoints = useMemo(
    () =>
      Selectors.getBoundingPoints(page, layerId, {
        groups: 'childrenOnly',
        includeHiddenLayers: true,
      }),
    [page, layerId],
  );

  return <Polyline points={boundingPoints} paint={paint} />;
});
