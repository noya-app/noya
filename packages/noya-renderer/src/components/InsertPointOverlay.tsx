import { useApplicationState } from 'noya-app-state-context';
import { useStroke } from 'noya-react-canvaskit';
import { Path, useCanvasKit } from 'noya-renderer';
import { Layers, Selectors } from 'noya-state';
import React, { memo } from 'react';
import { useTheme } from 'styled-components';
import PseudoPoint from './PseudoPoint';

export const InsertPointOverlay = memo(function InsertPointOverlay() {
  const [state] = useApplicationState();
  const page = Selectors.getCurrentPage(state);
  const CanvasKit = useCanvasKit();
  const { primary } = useTheme().colors;
  const paint = useStroke({ color: primary });

  if (state.interactionState.type !== 'editPath') return null;

  const { point } = state.interactionState;

  if (!point) return null;

  const layers = Layers.findAll(
    page,
    (layer) => layer.do_objectID in state.selectedPointLists,
  ).filter(Layers.isPointsLayer);

  const layer = layers.find((layer) =>
    Selectors.layerPathContainsPoint(CanvasKit, layer, point),
  );

  if (!layer) return null;

  const splitParameters = Selectors.getSplitLayerPathParameters(
    CanvasKit,
    layer,
    point,
  );

  if (!splitParameters) return;

  const { segmentPath, pointDistance } = splitParameters;

  return (
    <>
      <Path path={segmentPath} paint={paint} />
      <PseudoPoint point={pointDistance.point} />
    </>
  );
});
