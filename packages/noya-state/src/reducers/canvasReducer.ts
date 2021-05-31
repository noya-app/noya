import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import {
  AffineTransform,
  normalizeRect,
  rectsIntersect,
  createRect,
  createBounds,
  Size,
  Bounds,
} from 'noya-geometry';
import { Primitives, uuid } from 'noya-renderer';
import { resizeRect } from 'noya-renderer/src/primitives';
import * as Layers from '../layers';
import * as Models from '../models';
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
import {
  getLayersInRect,
  getSelectedRect,
} from '../selectors/geometrySelectors';
import { Axis } from 'noya-renderer/src/components/guides';

function getAxisValues(
  rectBounds: Bounds,
  axis: Axis,
): [number, number, number] {
  if (axis === 'x') {
    return [rectBounds.minX, rectBounds.midX, rectBounds.maxX];
  } else {
    return [rectBounds.minY, rectBounds.midY, rectBounds.maxY];
  }
}

function getVisibleLayersAxisValues(
  state: ApplicationState,
  interactionState: Extract<InteractionState, { type: 'moving' }>,
) {
  //  const { canvasInsets } = state;
  // const { pageSnapshot } = interactionState;
  const page = getCurrentPage(state);

  //TODO: get the measurements of the canvas
  const layers = getLayersInRect(
    state,
    {
      left: 100,
      right: 100,
    },
    createRect({ x: 0, y: 0 }, { x: 1000, y: 1000 }),
    {
      clickThroughGroups: false,
      includeHiddenLayers: false,
    },
  );
  const values: SelectedValueObj[] = [];
  layers.forEach(function (layer) {
    const rect = getBoundingRect(page, AffineTransform.identity, [
      layer.do_objectID,
    ]);
    if (rect) {
      const rectBounds = createBounds(rect);
      values.push({
        layerId: layer.do_objectID,
        y: getAxisValues(rectBounds, 'y'),
        x: getAxisValues(rectBounds, 'x'),
      });
    }
  });
  return values;
}

type SelectedValueObj = {
  layerId: string;
  y: [number, number, number];
  x: [number, number, number];
};

// function getSelectedLayerAxisValues(layer_id: string, layer: Sketch.AnyLayer) {
//   const selectedRect = getBoundingRect(layer, AffineTransform.identity, [
//     layer_id,
//   ]);

//   if (!selectedRect) return;

//   const rectBounds = createBounds(selectedRect);

//   return {
//     layerId: layer_id,
//     y: getAxisValues(rectBounds, 'y'),
//     x: getAxisValues(rectBounds, 'x'),
//   };
// }

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
      const selectedRect = getSelectedRect(state);
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
            if (!selectedRect) {
              console.info('No selected rect');
              return;
            }

            if (draft.TEST) return;

            let layerLeftPos: number | undefined = undefined;
            let layerTopPos: number | undefined = undefined;

            // console.log('top of equation', { layerLeftPos, layerTopPos });

            const { origin, current, pageSnapshot } = interactionState;

            // console.log({ interactionState });

            const visibleLayersInfo = getVisibleLayersAxisValues(
              state,
              interactionState,
            ).filter((info) => !layerIds.includes(info.layerId));

            const delta = {
              x: current.x - origin.x,
              y: current.y - origin.y,
            };

            const selectedBounds = createBounds(selectedRect);

            const xValues = getAxisValues(selectedBounds, 'x');
            const yValues = getAxisValues(selectedBounds, 'y');

            const pairs = getVisibleAndSelectedLayerAxisPairs(
              xValues,
              visibleLayersInfo,
              'x',
            );

            for (let pair of pairs) {
              const distance = Math.abs(
                pair.selectedLayerValue - pair.visibleLayerValue,
              );

              if (distance < 6) continue;

              const matchingLayerInfo = visibleLayersInfo.find((layer) => {
                return layer.layerId === pair.visibleLayerId;
              });

              if (!matchingLayerInfo) {
                console.warn('No layer match');
                continue;
              }

              // let offset = 0;

              //targ == pair
              //activeOnj == xValues

              if (Math.abs(selectedBounds.maxX - matchingLayerInfo.x[0]) < 6) {
                layerLeftPos = matchingLayerInfo.x[0] - 142;
              }
              if (Math.abs(selectedBounds.minX - matchingLayerInfo.x[2]) < 6) {
                layerLeftPos = matchingLayerInfo.x[0] + 158;
              }
              if (Math.abs(selectedBounds.maxY - matchingLayerInfo.y[0]) < 6) {
                layerTopPos = matchingLayerInfo.y[0] - 91;
              }
              if (Math.abs(matchingLayerInfo.y[2] - selectedBounds.minY) < 6) {
                layerTopPos = matchingLayerInfo.y[0] + 123;
              }
              // console.log({ layerLeftPos }, { layerTopPos });

              // if (xValues[0] === pair.selectedLayerValue) {
              //   console.log('selection minX');
              //   offset = 0;
              // } else if (xValues[1] === pair.selectedLayerValue) {
              //   console.log('selection midX');
              //   offset = xValues[1] - xValues[0];
              // } else {
              //   console.log('selection maxX');
              //   offset = xValues[2] - xValues[0];
              // }

              // if (matchingLayerInfo.x[0] === pair.selectedLayerValue) {
              //   console.log('match minX');
              //   delta.x = matchingLayerInfo.x[0] + offset;
              // } else if (matchingLayerInfo.x[1] === pair.selectedLayerValue) {
              //   console.log('match midX');
              //   delta.x = matchingLayerInfo.x[1] + offset;
              // } else {
              //   console.log('match maxX');
              //   delta.x = matchingLayerInfo.x[2] + offset;
              // }

              // const snapDelta =
              //   pair.selectedLayerValue - pair.visibleLayerValue;
              // delta.x -= snapDelta;

              // delta.x -= 100;

              break;
            }

            layerIndexPaths.forEach((indexPath) => {
              const initialRect = Layers.access(pageSnapshot, indexPath).frame;
              const layer = Layers.access(
                draft.sketch.pages[pageIndex],
                indexPath,
              );

              // console.log('current x', { current });
              // console.log('layerLeftPos', layerLeftPos);

              // console.log(
              //   'Math.abs(current.x - layerLeftPos)',
              //   layerLeftPos ? Math.abs(current.x - layerLeftPos) : '',
              // );
              // console.log('bottom of equation', { delta });

              // console.log({ layerLeftPos });
              // console.log({ layerTopPos });

              if (layerLeftPos) {
                layer.frame.x = layerLeftPos;
                layerLeftPos = undefined;
              } else {
                layer.frame.x = initialRect.x + delta.x;
              }
              if (layerTopPos) {
                layer.frame.y = layerTopPos;
                layerTopPos = undefined;
              } else {
                layer.frame.y = initialRect.y + delta.y;
              }

              // layer.frame.x = initialRect.x + delta.x;
              // layer.frame.y = initialRect.y + delta.y;

              // console.log(layer.do_objectID, visibleLayersInfo);
              // });

              //   // if (snapDistance !== undefined) {
              //   //   console.log({ snapDistance });
              //   //   layer.frame.x = snapDistance;
              //   // } else {
              //   layer.frame.x = initialRect.x + delta.x;
              //   // }

              //   layer.frame.y = initialRect.y + delta.y;
            });

            draft.canvasVisibleAndSelectedLayerAxisPairs = {
              xBounds: getVisibleAndSelectedLayerAxisPairs(
                xValues,
                visibleLayersInfo,
                'x',
              ),
              yBounds: getVisibleAndSelectedLayerAxisPairs(
                yValues,
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

            const meta: EncodedPageMetadata = draft.sketch.user[currentPageId];

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
