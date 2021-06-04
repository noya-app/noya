import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import {
  AffineTransform,
  Bounds,
  createBounds,
  createRect,
  normalizeRect,
  rectsIntersect,
  Size,
} from 'noya-geometry';
import { Primitives, uuid } from 'noya-renderer';
import { Axis } from 'noya-renderer/src/components/guides';
import { resizeRect } from 'noya-renderer/src/primitives';
import * as Layers from '../layers';
import * as Models from '../models';
import { getLayersInRect } from '../selectors/geometrySelectors';
import {
  EncodedPageMetadata,
  getBoundingRect,
  getCurrentPage,
  getCurrentPageIndex,
  getCurrentPageMetadata,
  getSelectedLayerIndexPathsExcludingDescendants,
} from '../selectors/selectors';
import { Point } from '../types';
import { ApplicationState } from './applicationReducer';
import {
  CompassDirection,
  InteractionAction,
  interactionReducer,
  InteractionState,
} from './interactionReducer';

function getAxisValues(
  rectBounds: Bounds,
  axis: Axis,
): [number, number, number] {
  if (axis === 'x') {
    // return [rectBounds.minX] as any;
    return [rectBounds.minX, rectBounds.midX, rectBounds.maxX];
  } else {
    // return [] as any;
    return [rectBounds.minY, rectBounds.midY, rectBounds.maxY];
  }
}

function getVisibleLayersAxisValues(
  selectedLayerIds: string[],
  state: ApplicationState,
  interactionState: Extract<InteractionState, { type: 'moving' }>,
) {
  const { canvasSize } = interactionState;

  const page = getCurrentPage(state);

  const allVisibleLayers = getLayersInRect(
    state,
    {
      left: 0,
      right: 0,
    },
    createRect({ x: canvasSize.width, y: 0 }, { x: 0, y: canvasSize.height }),
    {
      clickThroughGroups: false,
      includeHiddenLayers: false,
      includeArtboardLayers: true,
    },
  );
  let isLayerInGroup = false;
  let groupLayers: Sketch.AnyLayer[] = [];

  allVisibleLayers
    .filter(
      (layer): layer is Sketch.Group | Sketch.Artboard =>
        layer._class === 'artboard' || layer._class === 'group',
    )
    .forEach((group) => {
      if (group.layers.length === 0) {
        return;
      }

      const result = group.layers.filter(
        (groupLayer) => groupLayer.do_objectID === selectedLayerIds[0],
      );

      if (result.length > 0) {
        isLayerInGroup = true;
        group.layers.forEach((layer) => {
          groupLayers.push(layer);
        });
        groupLayers.push(group);
      }
    });

  const values: SelectedValueObj[] = [];
  const layers = isLayerInGroup ? groupLayers : allVisibleLayers;

  layers.forEach(function (visibleLayer) {
    const rect = getBoundingRect(
      page,
      AffineTransform.identity,
      [visibleLayer.do_objectID],
      {
        clickThroughGroups: true,
        includeHiddenLayers: true,
        includeArtboardLayers: false,
      },
    );
    if (rect) {
      const rectBounds = createBounds(rect);
      values.push({
        layerId: visibleLayer.do_objectID,
        y: getAxisValues(rectBounds, 'y'),
        x: getAxisValues(rectBounds, 'x'),
      });
    }
  });
  return values;
}

function findSmallestSnappingDistance(values: CombinationValue[]) {
  const getDelta = (pair: CombinationValue) =>
    pair.selectedLayerValue - pair.visibleLayerValue;

  const getDistance = (pair: CombinationValue) => Math.abs(getDelta(pair));

  const distances = values
    .filter((pair) => getDistance(pair) <= 6)
    .sort((a, b) => getDistance(a) - getDistance(b));

  return distances.length > 0 ? getDelta(distances[0]) : 0;
}

type SelectedValueObj = {
  layerId: string;
  y: [number, number, number];
  x: [number, number, number];
};

export type BoundsObj = {
  selectedLayerValues: [number, number, number];
  visibleLayerValues: [number, number, number];
  visibleLayerId: string;
};

export type CombinationValue = {
  selectedLayerValue: number;
  visibleLayerValue: number;
  visibleLayerId: string;
};

function allCombinations(obj: BoundsObj) {
  let combos: CombinationValue[] = [];
  obj.selectedLayerValues.forEach((selectedLayerValue) => {
    obj.visibleLayerValues.forEach((visibleLayerValue) => {
      combos.push({
        selectedLayerValue: selectedLayerValue,
        visibleLayerValue: visibleLayerValue,
        visibleLayerId: obj.visibleLayerId,
      });
    });
  });
  return combos;
}

function getVisibleAndSelectedLayerAxisPairs(
  selectedAxisValues: [number, number, number],
  visibleLayersAxisValues: SelectedValueObj[],
  axis: Axis,
) {
  return visibleLayersAxisValues.flatMap((visibleLayer) =>
    allCombinations({
      visibleLayerValues: visibleLayer[axis],
      selectedLayerValues: selectedAxisValues,
      visibleLayerId: visibleLayer.layerId,
    }),
  );
}

export type CanvasAction =
  | [
      type: 'insertArtboard',
      details: { name: string; width: number; height: number },
    ]
  | [type: 'addDrawnLayer']
  | [
      type: 'interaction',
      // Some actions may need to be augmented by additional state before
      // being passed to nested reducers (e.g. `maybeScale` takes a snapshot
      // of the current page). Maybe there's a better way? This still seems
      // better than moving the whole reducer up into the parent.
      action:
        | Exclude<InteractionAction, ['maybeMove' | 'maybeScale', ...any[]]>
        | [type: 'maybeMove', origin: Point, canvasSize: Size]
        | [
            type: 'maybeScale',
            origin: Point,
            direction: CompassDirection,
            canvasSize: Size,
          ],
    ];

export function canvasReducer(
  state: ApplicationState,
  action: CanvasAction,
): ApplicationState {
  switch (action[0]) {
    case 'insertArtboard': {
      const [, { name, width, height }] = action;
      const pageIndex = getCurrentPageIndex(state);
      const { scrollOrigin } = getCurrentPageMetadata(state);

      return produce(state, (draft) => {
        let layer = produce(Models.artboard, (layer) => {
          layer.do_objectID = uuid();
          layer.name = name;
          layer.frame = {
            _class: 'rect',
            constrainProportions: false,
            // TODO: Figure out positioning based on other artboards.
            // Also, don't hardcode sidebar width.
            x: -scrollOrigin.x + 100,
            y: -scrollOrigin.y + 100,
            width,
            height,
          };
        });

        draft.sketch.pages[pageIndex].layers.push(layer);
        draft.interactionState = interactionReducer(draft.interactionState, [
          'reset',
        ]);
        draft.selectedObjects = [layer.do_objectID];
      });
    }
    case 'addDrawnLayer': {
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (draft) => {
        if (draft.interactionState.type !== 'drawing') return;

        const layer = draft.interactionState.value;

        if (layer.frame.width > 0 && layer.frame.height > 0) {
          // Check if the layer intersects any artboards or symbolMasters.
          // If so, we'll insert the layer within
          const parent = draft.sketch.pages[pageIndex].layers
            .filter(
              (layer): layer is Sketch.Artboard | Sketch.SymbolMaster =>
                Layers.isArtboard(layer) || Layers.isSymbolMaster(layer),
            )
            .find((artboard) => rectsIntersect(artboard.frame, layer.frame));

          if (parent && Layers.isChildLayer(layer)) {
            layer.frame.x -= parent.frame.x;
            layer.frame.y -= parent.frame.y;

            parent.layers.push(layer);
          } else {
            draft.sketch.pages[pageIndex].layers.push(layer);
          }

          draft.selectedObjects = [layer.do_objectID];
        }

        draft.interactionState = interactionReducer(draft.interactionState, [
          'reset',
        ]);
      });
    }
    case 'interaction': {
      const page = getCurrentPage(state);
      const currentPageId = page.do_objectID;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPathsExcludingDescendants(
        state,
      );
      const layerIds = layerIndexPaths.map(
        (indexPath) => Layers.access(page, indexPath).do_objectID,
      );

      const interactionState = interactionReducer(
        state.interactionState,
        action[1][0] === 'maybeScale' || action[1][0] === 'maybeMove'
          ? [...action[1], page]
          : action[1],
      );

      return produce(state, (draft) => {
        draft.interactionState = interactionState;

        switch (interactionState.type) {
          case 'moving': {
            const { origin, current, pageSnapshot } = interactionState;

            const selectedRect = getBoundingRect(
              pageSnapshot,
              AffineTransform.identity,
              layerIds,
              {
                clickThroughGroups: true,
                includeHiddenLayers: false,
                includeArtboardLayers: false,
              },
            );

            if (!selectedRect) {
              console.info('No selected rect');
              return;
            }

            const delta = {
              x: current.x - origin.x,
              y: current.y - origin.y,
            };

            const visibleLayersInfo = getVisibleLayersAxisValues(
              layerIds,
              state,
              interactionState,
            ).filter((info) => !layerIds.includes(info.layerId));

            // Simulate where the selection rect would be, assuming no snapping
            selectedRect.x += delta.x;
            selectedRect.y += delta.y;

            const selectedBounds = createBounds(selectedRect);

            const xValues = getAxisValues(selectedBounds, 'x');
            const yValues = getAxisValues(selectedBounds, 'y');

            const xPairs = getVisibleAndSelectedLayerAxisPairs(
              xValues,
              visibleLayersInfo,
              'x',
            );

            const yPairs = getVisibleAndSelectedLayerAxisPairs(
              yValues,
              visibleLayersInfo,
              'y',
            );

            delta.y -= findSmallestSnappingDistance(yPairs);
            delta.x -= findSmallestSnappingDistance(xPairs);

            layerIndexPaths.forEach((indexPath) => {
              const initialRect = Layers.access(pageSnapshot, indexPath).frame;
              const layer = Layers.access(
                draft.sketch.pages[pageIndex],
                indexPath,
              );

              layer.frame.x = initialRect.x + delta.x;
              layer.frame.y = initialRect.y + delta.y;
            });

            const selectedRectAfter = getBoundingRect(
              draft.sketch.pages[pageIndex],
              AffineTransform.identity,
              layerIds,
              {
                clickThroughGroups: true,
                includeHiddenLayers: false,
                includeArtboardLayers: false,
              },
            );

            if (!selectedRectAfter) return;

            const selectedBoundsAfter = createBounds(selectedRectAfter);

            draft.possibleSnapGuides = {
              x: getVisibleAndSelectedLayerAxisPairs(
                getAxisValues(selectedBoundsAfter, 'x'),
                visibleLayersInfo,
                'x',
              ),
              y: getVisibleAndSelectedLayerAxisPairs(
                getAxisValues(selectedBoundsAfter, 'y'),
                visibleLayersInfo,
                'y',
              ),
            };

            break;
          }
          case 'scaling': {
            const {
              origin,
              current,
              pageSnapshot,
              direction,
            } = interactionState;

            const originalBoundingRect = getBoundingRect(
              pageSnapshot,
              AffineTransform.identity,
              layerIds,
            )!;

            const newBoundingRect = resizeRect(
              originalBoundingRect,
              {
                x: current.x - origin.x,
                y: current.y - origin.y,
              },
              direction,
            );

            const originalTransform = AffineTransform.multiply(
              AffineTransform.translation(
                originalBoundingRect.x,
                originalBoundingRect.y,
              ),
              AffineTransform.scale(
                originalBoundingRect.width,
                originalBoundingRect.height,
              ),
            ).invert();

            const newTransform = AffineTransform.multiply(
              AffineTransform.translation(newBoundingRect.x, newBoundingRect.y),
              AffineTransform.scale(
                newBoundingRect.width,
                newBoundingRect.height,
              ),
            );

            layerIndexPaths.forEach((layerIndex) => {
              const originalLayer = Layers.access(pageSnapshot, layerIndex);

              const layerTransform = AffineTransform.multiply(
                ...Layers.accessPath(pageSnapshot, layerIndex)
                  .slice(1, -1) // Remove the page and current layer
                  .map((layer) =>
                    AffineTransform.translation(layer.frame.x, layer.frame.y),
                  )
                  .reverse(),
              );

              const newLayer = Layers.access(
                draft.sketch.pages[pageIndex],
                layerIndex,
              );

              const min = AffineTransform.multiply(
                layerTransform.invert(),
                newTransform,
                originalTransform,
                layerTransform,
              ).applyTo({
                x: originalLayer.frame.x,
                y: originalLayer.frame.y,
              });

              const max = AffineTransform.multiply(
                layerTransform.invert(),
                newTransform,
                originalTransform,
                layerTransform,
              ).applyTo({
                x: originalLayer.frame.x + originalLayer.frame.width,
                y: originalLayer.frame.y + originalLayer.frame.height,
              });

              const newFrame = normalizeRect({
                x: Math.round(min.x),
                y: Math.round(min.y),
                width: Math.round(max.x - min.x),
                height: Math.round(max.y - min.y),
              });

              newLayer.frame.x = newFrame.x;
              newLayer.frame.y = newFrame.y;
              newLayer.frame.width = newFrame.width;
              newLayer.frame.height = newFrame.height;
            });

            break;
          }
          case 'panning': {
            const { previous, next } = interactionState;

            const delta = {
              x: next.x - previous.x,
              y: next.y - previous.y,
            };

            const meta: EncodedPageMetadata = draft.sketch.user[
              currentPageId
            ] ?? {
              zoomValue: 1,
              scrollOrigin: '{100,100}',
            };

            const parsed = Primitives.parsePoint(meta.scrollOrigin);

            parsed.x += delta.x;
            parsed.y += delta.y;

            draft.sketch.user[currentPageId] = {
              ...meta,
              scrollOrigin: Primitives.stringifyPoint(parsed),
            };

            break;
          }
        }
      });
    }
    default:
      return state;
  }
}
