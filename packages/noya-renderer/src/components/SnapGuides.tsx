import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useApplicationState } from 'noya-app-state-context';
import {
  AffineTransform,
  Axis,
  createBounds,
  distance,
  Point,
  Rect,
} from 'noya-geometry';
import {
  getLayerSnapValues,
  getPossibleSnapLayers,
  getSnaps,
  getSnapValues,
  Selectors,
} from 'noya-state';
import { groupBy } from 'noya-utils';
import React, { memo, useMemo } from 'react';
import AlignmentGuides from './AlignmentGuides';
import ExtensionGuide from './ExtensionGuide';
import {
  AXES,
  getAxisProperties,
  getGuides,
  Guides,
  X_DIRECTIONS,
  Y_DIRECTIONS,
} from './guides';
import MeasurementGuide from './MeasurementGuide';

interface Props {
  page: Sketch.Page;
  sourceRect: Rect;
  targetLayers: Sketch.AnyLayer[];
  axis: Axis;
}

const SnapGuidesAxis = memo(function SnapGuidesAxis({
  page,
  sourceRect,
  targetLayers,
  axis,
}: Props) {
  const sourceValues = getSnapValues(sourceRect, axis);

  const snaps = targetLayers
    .flatMap((targetLayer) =>
      getSnaps(
        sourceValues,
        getLayerSnapValues(page, targetLayer.do_objectID, axis),
        targetLayer.do_objectID,
      ),
    )
    .filter((pair) => pair.source === pair.target);

  const targetLayerBoundingRectMap = Selectors.getBoundingRectMap(
    page,
    snaps.map((pair) => pair.targetId),
    {
      clickThroughGroups: true,
      includeHiddenLayers: false,
      includeArtboardLayers: false,
    },
  );

  const getMinGuideDistance = (guides: Guides[]) =>
    Math.min(...guides.map((guide) => distance(...guide.measurement)));

  const nearestLayerGuides = snaps
    .map((pair) => {
      const targetRect = targetLayerBoundingRectMap[pair.targetId];

      const directions = axis === 'y' ? X_DIRECTIONS : Y_DIRECTIONS;

      return directions.flatMap(
        ([direction, axis]) =>
          getGuides(direction, axis, sourceRect, targetRect) ?? [],
      );
    })
    .sort((a, b) => getMinGuideDistance(a) - getMinGuideDistance(b));

  const guides =
    nearestLayerGuides.length > 0 ? nearestLayerGuides[0] : undefined;

  if (!guides) return null;

  const groupedSnaps = groupBy(snaps, (value) => value.source);
  const selectedBounds = createBounds(sourceRect);

  const alignmentGuides = Object.values(groupedSnaps).map((pairs): Point[] => {
    const targetBounds = pairs
      .map(({ targetId }) => targetLayerBoundingRectMap[targetId])
      .map(createBounds);

    const m = axis;
    const c = axis === 'x' ? 'y' : 'x';

    const [minC, , maxC] = getAxisProperties(c, '+');

    return [
      {
        [m]: pairs[0].target,
        [c]: Math.min(
          selectedBounds[minC],
          ...targetBounds.map((bounds) => bounds[minC]),
        ),
      } as Point,
      {
        [m]: pairs[0].target,
        [c]: Math.max(
          selectedBounds[maxC],
          ...targetBounds.map((bounds) => bounds[maxC]),
        ),
      } as Point,
    ];
  });

  return (
    <>
      <AlignmentGuides lines={alignmentGuides} />
      {guides.map((guide, i) => (
        <ExtensionGuide key={i} points={guide.extension} />
      ))}
      {guides.map((guide, i) => (
        <MeasurementGuide key={i} measurement={guide.measurement} />
      ))}
    </>
  );
});

export default memo(function SnapGuides() {
  const [state] = useApplicationState();
  const interactionState = state.interactionState;
  const page = Selectors.getCurrentPage(state);
  const boundingRect = useMemo(
    () =>
      Selectors.getBoundingRect(
        page,
        AffineTransform.identity,
        state.selectedObjects,
        {
          clickThroughGroups: true,
          includeHiddenLayers: true,
          includeArtboardLayers: false,
        },
      ),
    [page, state.selectedObjects],
  );

  if (interactionState.type !== 'moving' || !boundingRect) return null;

  const layerIndexPaths = Selectors.getSelectedLayerIndexPathsExcludingDescendants(
    state,
  );

  const targetLayers = getPossibleSnapLayers(
    state,
    layerIndexPaths,
    interactionState.canvasSize,
  )
    // Ensure we don't snap to the selected layer itself
    .filter((layer) => !state.selectedObjects.includes(layer.do_objectID));

  return (
    <>
      {AXES.map((axis) => (
        <SnapGuidesAxis
          key={axis}
          axis={axis}
          targetLayers={targetLayers}
          sourceRect={boundingRect}
          page={page}
        />
      ))}
    </>
  );
});
