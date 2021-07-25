import { useApplicationState } from 'noya-app-state-context';
import { AffineTransform, Axis, createBounds, Point } from 'noya-geometry';
import {
  getLayerSnapValues,
  getPossibleSnapLayers,
  getPossibleSnaps,
  getSnapValues,
  PossibleSnap,
  Selectors,
} from 'noya-state';
import { groupBy } from 'noya-utils';
import React, { Fragment, memo, useMemo } from 'react';
import AlignmentGuides from './AlignmentGuides';
import ExtensionGuide from './ExtensionGuide';
import {
  getAxisProperties,
  getGuides,
  Guides,
  X_DIRECTIONS,
  Y_DIRECTIONS,
} from './guides';
import MeasurementGuide from './MeasurementGuide';

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

  const smartSnapGuides = useMemo(() => {
    if (interactionState.type !== 'moving' || !boundingRect) return;

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

    const sourceXs = getSnapValues(boundingRect, 'x');
    const sourceYs = getSnapValues(boundingRect, 'y');

    const xSnaps = targetLayers
      .flatMap((targetLayer) =>
        getPossibleSnaps(
          sourceXs,
          getLayerSnapValues(page, targetLayer.do_objectID, 'x'),
          targetLayer.do_objectID,
        ),
      )
      .filter((pair) => pair.source === pair.target);

    const ySnaps = targetLayers
      .flatMap((targetLayer) =>
        getPossibleSnaps(
          sourceYs,
          getLayerSnapValues(page, targetLayer.do_objectID, 'y'),
          targetLayer.do_objectID,
        ),
      )
      .filter((pair) => pair.source === pair.target);

    const axisSnappingPairs: [Axis, PossibleSnap[]][] = [
      ['x', xSnaps],
      ['y', ySnaps],
    ];

    const layerBoundsMap = Selectors.getBoundingRectMap(
      page,
      [...xSnaps, ...ySnaps].map((pair) => pair.targetId),
      {
        clickThroughGroups: true,
        includeHiddenLayers: false,
        includeArtboardLayers: false,
      },
    );

    const nearestLayerGuides = axisSnappingPairs.map(
      ([axis, snappingPairs]) => {
        const getMinGuideDistance = (guides: Guides[]) =>
          Math.min(
            ...guides.map((guide) => guide.distanceMeasurement.distance),
          );

        const guides = snappingPairs
          .map((pair) => {
            const visibleLayerBounds = layerBoundsMap[pair.targetId];

            const directions = axis === 'y' ? X_DIRECTIONS : Y_DIRECTIONS;

            return directions.flatMap(
              ([direction, axis]) =>
                getGuides(direction, axis, boundingRect, visibleLayerBounds) ??
                [],
            );
          })
          .sort((a, b) => getMinGuideDistance(a) - getMinGuideDistance(b));

        return guides.length > 0 ? guides[0] : undefined;
      },
    );

    const alignmentGuides = axisSnappingPairs.flatMap(
      ([axis, snappingPairs]) => {
        const groupedPairs = groupBy(snappingPairs, (value) => value.source);
        const selectedBounds = createBounds(boundingRect);

        return Object.values(groupedPairs).map((pairs): Point[] => {
          const targetBounds = pairs
            .map(({ targetId }) => layerBoundsMap[targetId])
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
      },
    );

    return (
      <>
        <AlignmentGuides lines={alignmentGuides} />
        {nearestLayerGuides.map(
          (guides, i) =>
            guides && (
              <Fragment key={i}>
                {guides.map((guide, j) => (
                  <ExtensionGuide
                    key={`extension-${i}-${j}`}
                    points={guide.extension}
                  />
                ))}
                {guides.map((guide, j) => (
                  <MeasurementGuide
                    key={`measurement-${i}-${j}`}
                    distanceMeasurement={guide.distanceMeasurement!}
                    measurement={guide.measurement}
                  />
                ))}
              </Fragment>
            ),
        )}
      </>
    );
  }, [interactionState, boundingRect, state, page]);

  return smartSnapGuides ?? null;
});
