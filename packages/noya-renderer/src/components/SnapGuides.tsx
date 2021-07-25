import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useApplicationState, useWorkspace } from 'noya-app-state-context';
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
  getPossibleTargetSnapLayers,
  getSnaps,
  getSnapValues,
  Selectors,
} from 'noya-state';
import { groupBy } from 'noya-utils';
import React, { Fragment, memo, useMemo } from 'react';
import {
  AXES,
  getAxisProperties,
  getGuides,
  Guides,
  X_DIRECTIONS,
  Y_DIRECTIONS,
} from '../guides';
import { AlignmentGuide, ExtensionGuide, MeasurementGuide } from './Guides';
import { MeasurementLabel } from './MeasurementLabel';

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

  const alignmentGuides = Object.values(groupedSnaps).map((pairs): [
    Point,
    Point,
  ] => {
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
      {alignmentGuides.map((points, index) => (
        <AlignmentGuide key={index} points={points} />
      ))}
      {guides.map((guide, index) => (
        <Fragment key={index}>
          <ExtensionGuide points={guide.extension} />
          <MeasurementGuide points={guide.measurement} />
          <MeasurementLabel points={guide.measurement} />
        </Fragment>
      ))}
    </>
  );
});

export default memo(function SnapGuides() {
  const { canvasSize } = useWorkspace();
  const [state] = useApplicationState();
  const interactionState = state.interactionState;
  const page = Selectors.getCurrentPage(state);

  const sourceRect = useMemo(() => {
    switch (interactionState.type) {
      case 'moving':
        return Selectors.getBoundingRect(
          page,
          AffineTransform.identity,
          state.selectedObjects,
          {
            clickThroughGroups: true,
            includeHiddenLayers: true,
            includeArtboardLayers: false,
          },
        );
      case 'insertRectangle':
        const point = interactionState.point;

        if (!point) return;

        return { x: point.x, y: point.y, width: 0, height: 0 };
    }
  }, [interactionState, page, state.selectedObjects]);

  if (!sourceRect) return null;

  const layerIndexPaths = Selectors.getSelectedLayerIndexPathsExcludingDescendants(
    state,
  );

  const targetLayers = getPossibleTargetSnapLayers(
    state,
    canvasSize,
    layerIndexPaths,
  );

  return (
    <>
      {AXES.map((axis) => (
        <SnapGuidesAxis
          key={axis}
          axis={axis}
          targetLayers={targetLayers}
          sourceRect={sourceRect}
          page={page}
        />
      ))}
    </>
  );
});
