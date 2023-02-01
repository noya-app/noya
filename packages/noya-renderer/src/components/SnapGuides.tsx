import { useApplicationState, useWorkspace } from 'noya-app-state-context';
import Sketch from 'noya-file-format';
import {
  AffineTransform,
  Axis,
  createBounds,
  createRect,
  distance,
  normalizeRect,
  Point,
  Rect,
  Size,
} from 'noya-geometry';
import {
  getLayerSnapValues,
  getPossibleTargetSnapLayers,
  getRectExtentPoint,
  getScaledSnapBoundingRect,
  getSnaps,
  getSnapValues,
  Selectors,
} from 'noya-state';
import { groupBy, round } from 'noya-utils';
import React, { Fragment, memo, useMemo } from 'react';
import { Group } from '../ComponentsContext';
import {
  AXES,
  getAxisProperties,
  getGuides,
  Guides,
  X_DIRECTIONS,
  Y_DIRECTIONS,
} from '../guides';
import { useZoom } from '../ZoomContext';
import { AreaMeasurementLabel } from './AreaMeasurementLabel';
import { DistanceMeasurementLabel } from './DistanceMeasurementLabel';
import { AlignmentGuide, ExtensionGuide, MeasurementGuide } from './Guides';

interface Props {
  page: Sketch.Page;
  sourceRect: Rect;
  targetLayers: Sketch.AnyLayer[];
  axis: Axis;
  showLabels: boolean;
}

const SnapGuidesAxis = memo(function SnapGuidesAxis({
  page,
  sourceRect,
  targetLayers,
  axis,
  showLabels,
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
    { groups: 'childrenOnly' },
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

  const alignmentGuides = Object.values(groupedSnaps).map(
    (pairs): [Point, Point] => {
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
    },
  );

  return (
    <>
      {alignmentGuides.map((points, index) => (
        <AlignmentGuide key={index} points={points} />
      ))}
      {guides.map((guide, index) => (
        <Fragment key={index}>
          <ExtensionGuide points={guide.extension} />
          <MeasurementGuide points={guide.measurement} />
          {showLabels && (
            <DistanceMeasurementLabel points={guide.measurement} />
          )}
        </Fragment>
      ))}
    </>
  );
});

export default memo(function SnapGuides({
  showLabels = true,
}: {
  showLabels?: boolean;
}) {
  const { canvasSize } = useWorkspace();
  const [state] = useApplicationState();
  const zoom = useZoom();
  const interactionState = state.interactionState;
  const page = Selectors.getCurrentPage(state);

  const adjustedSource = useMemo(():
    | { snapRect: Rect; areaSize: Size }
    | undefined => {
    switch (interactionState.type) {
      case 'moving': {
        const rect = Selectors.getBoundingRect(page, state.selectedLayerIds, {
          groups: 'childrenOnly',
          includeHiddenLayers: true,
        });

        if (!rect) return;

        return {
          snapRect: rect,
          areaSize: rect,
        };
      }
      case 'scaling': {
        const { origin, current, pageSnapshot, direction } = interactionState;

        const delta = {
          x: current.x - origin.x,
          y: current.y - origin.y,
        };

        const originalBoundingRect = Selectors.getBoundingRect(
          pageSnapshot,
          state.selectedLayerIds,
        );

        if (!originalBoundingRect) return;

        const lineLayer = Selectors.getSelectedLineLayer(state);

        // TODO: Snap when moving line layers and points
        if (lineLayer) return;

        const selectedIndexPaths =
          Selectors.getSelectedLayerIndexPathsExcludingDescendants(state);

        const newBoundingRect = getScaledSnapBoundingRect(
          state,
          pageSnapshot,
          originalBoundingRect,
          delta,
          canvasSize,
          direction,
          {
            constrainProportions: Selectors.getConstrainedScaling(
              state,
              pageSnapshot,
              selectedIndexPaths,
            ),
            scalingOriginMode: state.keyModifiers.altKey ? 'center' : 'extent',
          },
        );

        const newExtentPoint = getRectExtentPoint(newBoundingRect, direction);
        return {
          snapRect: createRect(newExtentPoint, newExtentPoint),
          areaSize: normalizeRect(newBoundingRect),
        };
      }
      case 'insert': {
        const point = interactionState.point;

        if (!point) return;

        const rect = createRect(point, point);

        return { snapRect: rect, areaSize: rect };
      }
      case 'drawing': {
        const { origin, current } = interactionState;

        if (!current) return;

        const rect = Selectors.getDrawnLayerRect(origin, current, {
          constrainProportions: state.keyModifiers.shiftKey,
          scalingOriginMode: state.keyModifiers.altKey ? 'center' : 'extent',
        });

        return {
          snapRect: createRect(current, current),
          areaSize: rect,
        };
      }
    }
  }, [canvasSize, interactionState, page, state]);

  const snapRect = adjustedSource?.snapRect;
  const areaSize = adjustedSource?.areaSize;

  const areaMeasurementLabel = useMemo(() => {
    if (!showLabels) return null;

    if (
      !areaSize ||
      (interactionState.type !== 'drawing' &&
        interactionState.type !== 'scaling')
    )
      return null;

    const origin = {
      x: interactionState.current.x,
      y: interactionState.current.y,
    };

    return (
      <Group
        transform={AffineTransform.translate(origin.x, origin.y)
          .scale(1 / zoom, 1 / zoom)
          .translate(20, 20)}
      >
        <AreaMeasurementLabel
          text={`${round(areaSize.width, 2)} × ${round(areaSize.height, 2)}`}
          fontSize={14}
          padding={{
            width: 8,
            height: 4,
          }}
        />
      </Group>
    );
  }, [areaSize, interactionState, showLabels, zoom]);

  if (!snapRect) return null;

  const targetLayers = getPossibleTargetSnapLayers(
    state,
    page,
    canvasSize,
    interactionState.type === 'moving' || interactionState.type === 'scaling'
      ? Selectors.getSelectedLayerIndexPathsExcludingDescendants(state)
      : undefined,
  );

  return (
    <>
      {AXES.map((axis) => (
        <SnapGuidesAxis
          key={axis}
          axis={axis}
          targetLayers={targetLayers}
          sourceRect={snapRect}
          page={page}
          showLabels={showLabels && interactionState.type === 'moving'}
        />
      ))}
      {areaMeasurementLabel}
    </>
  );
});
