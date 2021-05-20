import produce from 'immer';
import { AffineTransform, normalizeRect, createRect } from 'noya-geometry';
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
} from './interactionReducer';
import {getLayersInRect} from '../selectors/geometrySelectors';
import { createBounds } from 'noya-geometry';

/* Finding all visibile layers */
function getAxisValues(rectBounds: any, axis: string){
  let axisBounds:any = {};
  for(const prop in rectBounds){
    if(prop.indexOf(axis) > -1){
      axisBounds[prop] = rectBounds[prop] 
    } 
  }
  return axisBounds;
}

function getVisibleLayersAxisValues(state:any, pageSnapshot:any){
  //  const { canvasInsets } = state;
  //  const { origin, current } = state.interactionState;
  
   //TODO: get the measurements of the canvas
   const layers = getLayersInRect(
    state,
    {
      left: 100,
      right: 100,
    },
    createRect({x: 0, y:0}, {x: 1000, y:1000}),
    {
      clickThroughGroups: false,
      includeHiddenLayers: false,
    },
  );
  
    const yValues:any = [];
    const xValues:any = [];
    layers.forEach(function(layer){
      const rect = getBoundingRect(
      pageSnapshot,
      AffineTransform.identity,
      [layer.do_objectID],
    )
    if(rect){
      const rectBounds:any = createBounds(rect);
       yValues.push({layer_id: layer.do_objectID, bounds: getAxisValues(rectBounds, 'Y')})
       xValues.push({layer_id: layer.do_objectID, bounds: getAxisValues(rectBounds, 'X')})
    }
  })
   return yValues;
}

function getSelectedLayerAxisValues(layer_id:string, pageSnapshot:any){
  const selectedRect = getBoundingRect(
    pageSnapshot,
    AffineTransform.identity,
    [layer_id],
  )
  const ySelectedValues:any = [];
  const xSelectedValues:any = [];

  if(selectedRect){
    const rectBounds:any = createBounds(selectedRect);
    ySelectedValues.push({layer_id: layer_id, bounds: getAxisValues(rectBounds, 'Y')})
    xSelectedValues.push({layer_id: layer_id, bounds: getAxisValues(rectBounds, 'X')})
  }

  return ySelectedValues;
}

function getVisibleAndSelectedLayerAxisPairs(selectedAxisValues:any[], visibleLayersAxisValues:any[]){
  // const results = visibleLayersAxisValues
  //   .filter((visibleLayer) => visibleLayer.layer_id !== selectedAxisValues[0].layer_id)
  //   .map(visibleLayer => {
  //     return [selectedAxisValues[0].bounds.minY, visibleLayer.bounds.minY]
  //   })
    //console.log('results', results)
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
        | [type: 'maybeMove', origin: Point]
        | [type: 'maybeScale', origin: Point, direction: CompassDirection],
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
          draft.sketch.pages[pageIndex].layers.push(layer);
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
            const layers = getVisibleLayersAxisValues(state, pageSnapshot);

            const delta = {
              x: current.x - origin.x,
              y: current.y - origin.y,
            };

            layerIndexPaths.forEach((indexPath) => {
              const initialRect = Layers.access(pageSnapshot, indexPath).frame;
              const layer = Layers.access(
                draft.sketch.pages[pageIndex],
                indexPath,
              );
              const selectionValues = getSelectedLayerAxisValues(layer.do_objectID, pageSnapshot);
              getVisibleAndSelectedLayerAxisPairs(selectionValues, layers)

              layer.frame.x = initialRect.x + delta.x;
              layer.frame.y = initialRect.y + delta.y;
            });

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
