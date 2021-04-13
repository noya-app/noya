import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { Primitives, uuid } from 'noya-renderer';
import { resizeRect } from 'noya-renderer/src/primitives';
import { SketchFile } from 'noya-sketch-file';
import { sum } from 'noya-utils';
import { IndexPath } from 'tree-visit';
import { transformRect, createBounds, normalizeRect } from 'noya-geometry';
import * as Layers from '../layers';
import * as Models from '../models';
import {
  EncodedPageMetadata,
  getBoundingRect,
  getCurrentPage,
  getCurrentPageIndex,
  getCurrentPageMetadata,
  getLayerRotation,
  getLayerRotationMultiplier,
  getLayerTransformAtIndexPath,
  getSelectedLayerIndexPaths,
  getSelectedLayerIndexPathsExcludingDescendants,
  getSelectedRect,
  getCurrentTab,
} from '../selectors';
import { Bounds, Point, UUID } from '../types';
import { AffineTransform } from 'noya-geometry';
import {
  CompassDirection,
  createInitialInteractionState,
  InteractionAction,
  interactionReducer,
  InteractionState,
} from './interaction';
import { SetNumberMode, StyleAction, styleReducer } from './style';

export type { SetNumberMode };

export type WorkspaceTab = 'canvas' | 'theme';

export type ThemeTab = 'swatches' | 'textStyles' | 'layerStyles' | 'symbols';

export type LayerHighlightPrecedence = 'aboveSelection' | 'belowSelection';

export type LayerHighlight = {
  id: string;
  precedence: LayerHighlightPrecedence;
};

export type ApplicationState = {
  currentTab: WorkspaceTab;
  currentThemeTab: ThemeTab;
  interactionState: InteractionState;
  highlightedLayer?: LayerHighlight;
  selectedPage: string;
  selectedObjects: string[];
  selectedSwatchIds: string[];
  selectedLayerStyleIds: string[];
  sketch: SketchFile;
  canvasSize: { width: number; height: number };
  canvasInsets: { left: number; right: number };
  preferences: {
    showRulers: boolean;
  };
};

export type SelectionType = 'replace' | 'intersection' | 'difference';

export type Action =
  | [type: 'setTab', value: WorkspaceTab]
  | [type: 'setThemeTab', value: ThemeTab]
  | [
      type: 'setCanvasSize',
      size: { width: number; height: number },
      insets: { left: number; right: number },
    ]
  | [type: 'setShowRulers', value: boolean]
  | [type: 'movePage', sourceIndex: number, destinationIndex: number]
  | [
      type: 'insertArtboard',
      details: { name: string; width: number; height: number },
    ]
  | [type: 'addDrawnLayer']
  | [
      type: 'selectLayer',
      layerId: string | string[] | undefined,
      selectionType?: SelectionType,
    ]
  | [
      type: 'selectSwatch',
      swatchId: string | string[] | undefined,
      selectionType?: SelectionType,
    ]
  | [
      type: 'selectLayerStyle',
      layerId: string | string[] | undefined,
      selectionType?: SelectionType,
    ]
  | [type: 'highlightLayer', highlight: LayerHighlight | undefined]
  | [type: 'setLayerVisible', layerId: string | string[], visible: boolean]
  | [type: 'setExpandedInLayerList', layerId: string, expanded: boolean]
  | [type: 'selectPage', pageId: UUID]
  | [type: 'distributeLayers', placement: 'horizontal' | 'vertical']
  | [
      type: 'alignLayers',
      placement:
        | 'left'
        | 'centerHorizontal'
        | 'right'
        | 'top'
        | 'centerVertical'
        | 'bottom',
    ]
  | [type: 'setLayerRotation', rotation: number, mode?: SetNumberMode]
  | [type: 'setFixedRadius', amount: number, mode?: SetNumberMode]
  | [type: 'setSwatchColor', id: string | string[], color: Sketch.Color]
  | [
      type: 'setSwatchOpacity',
      id: string | string[],
      alpha: number,
      mode?: SetNumberMode,
    ]
  | [type: 'addColorSwatch']
  | [type: 'addLayerStyle', name?: string, style?: Sketch.Style]
  | [type: 'updateLayerStyle', id: string, style: Sketch.Style | undefined]
  | [
      type: 'interaction',
      // Some actions may need to be augmented by additional state before
      // being passed to nested reducers (e.g. `maybeScale` takes a snapshot
      // of the current page). Maybe there's a better way? This still seems
      // better than moving the whole reducer up into the parent.
      action:
        | Exclude<InteractionAction, ['maybeScale', ...any[]]>
        | [type: 'maybeScale', origin: Point, direction: CompassDirection],
    ]
  | [type: `setSwatchName`, id: string | string[], name: string]
  | [type: `setLayerStyleName`, id: string | string[], name: string]
  | [type: 'setLayerStyle', id?: string, style?: Sketch.Style | undefined]
  | [type: 'removeSwatch']
  | [type: 'removeLayerStyle']
  | StyleAction;

export function reducer(
  state: ApplicationState,
  action: Action,
): ApplicationState {
  switch (action[0]) {
    case 'setTab': {
      const [, value] = action;

      return produce(state, (state) => {
        state.currentTab = value;
        state.interactionState = interactionReducer(state.interactionState, [
          'reset',
        ]);
      });
    }
    case 'setThemeTab': {
      const [, value] = action;

      return produce(state, (state) => {
        state.currentThemeTab = value;
      });
    }
    case 'setCanvasSize': {
      const [, size, insets] = action;

      return produce(state, (state) => {
        state.canvasSize = size;
        state.canvasInsets = insets;
      });
    }
    case 'setShowRulers': {
      const [, value] = action;

      return produce(state, (state) => {
        state.preferences.showRulers = value;
      });
    }
    case 'insertArtboard': {
      const [, { name, width, height }] = action;
      const pageIndex = getCurrentPageIndex(state);
      const { scrollOrigin } = getCurrentPageMetadata(state);

      return produce(state, (state) => {
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

        state.sketch.pages[pageIndex].layers.push(layer);
        state.interactionState = interactionReducer(state.interactionState, [
          'reset',
        ]);
        state.selectedObjects = [layer.do_objectID];
      });
    }
    case 'setLayerVisible': {
      const [, id, visible] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPaths = Layers.findAllIndexPaths(page, (layer) =>
        ids.includes(layer.do_objectID),
      );

      return produce(state, (state) => {
        const layers = accessPageLayers(state, pageIndex, indexPaths);

        layers.forEach((layer) => {
          layer.isVisible = visible;
        });
      });
    }
    case 'setExpandedInLayerList': {
      const [, id, expanded] = action;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPath = Layers.findIndexPath(
        page,
        (layer) => layer.do_objectID === id,
      );

      if (!indexPath) return state;

      return produce(state, (state) => {
        const layer = Layers.access(state.sketch.pages[pageIndex], indexPath);

        layer.layerListExpandedType = expanded
          ? Sketch.LayerListExpanded.Expanded
          : Sketch.LayerListExpanded.Collapsed;
      });
    }
    case 'addDrawnLayer': {
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (state) => {
        if (state.interactionState.type !== 'drawing') return;

        const layer = state.interactionState.value;

        if (layer.frame.width > 0 && layer.frame.height > 0) {
          state.sketch.pages[pageIndex].layers.push(layer);
          state.selectedObjects = [layer.do_objectID];
        }

        state.interactionState = interactionReducer(state.interactionState, [
          'reset',
        ]);
      });
    }
    case 'selectLayer': {
      const [, id, selectionType = 'replace'] = action;

      const ids = id === undefined ? [] : typeof id === 'string' ? [id] : id;

      return produce(state, (state) => {
        switch (selectionType) {
          case 'intersection':
            state.selectedObjects.push(
              ...ids.filter((id) => !state.selectedObjects.includes(id)),
            );
            return;
          case 'difference':
            ids.forEach((id) => {
              const selectedIndex = state.selectedObjects.indexOf(id);
              state.selectedObjects.splice(selectedIndex, 1);
            });
            return;
          case 'replace':
            state.selectedObjects = [...ids];
            return;
        }
      });
    }
    case 'highlightLayer': {
      const [, highlight] = action;

      return produce(state, (state) => {
        state.highlightedLayer = highlight ? { ...highlight } : undefined;
      });
    }
    case 'selectPage': {
      return produce(state, (state) => {
        state.selectedPage = action[1];
      });
    }
    case 'distributeLayers': {
      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);
      const selectedRect = getSelectedRect(state);
      const [, axis] = action;

      return produce(state, (state) => {
        const layers = accessPageLayers(state, pageIndex, layerIndexPaths);
        const combinedWidths = sum(layers.map((layer) => layer.frame.width));
        const combinedHeights = sum(layers.map((layer) => layer.frame.height));
        const differenceWidth = selectedRect.width - combinedWidths;
        const differenceHeight = selectedRect.height - combinedHeights;
        const gapX = differenceWidth / (layers.length - 1);
        const gapY = differenceHeight / (layers.length - 1);
        const sortBy = axis === 'horizontal' ? 'midX' : 'midY';

        // Bounds are all transformed to the page's coordinate system
        function getNormalizedBounds(
          page: Sketch.Page,
          layerIndexPath: IndexPath,
        ): Bounds {
          const layer = Layers.access(page, layerIndexPath);
          const transform = getLayerTransformAtIndexPath(
            page,
            layerIndexPath,
            AffineTransform.identity,
          );
          return createBounds(transformRect(layer.frame, transform));
        }

        const sortedLayerIndexPaths = layerIndexPaths.sort(
          (a, b) =>
            getNormalizedBounds(page, a)[sortBy] -
            getNormalizedBounds(page, b)[sortBy],
        );

        let currentX = 0;
        let currentY = 0;

        sortedLayerIndexPaths.forEach((layerIndexPath) => {
          const transform = getLayerTransformAtIndexPath(
            page,
            layerIndexPath,
            AffineTransform.identity,
          ).invert();
          const layer = Layers.access(
            state.sketch.pages[pageIndex], // access page again since we need to write to it
            layerIndexPath,
          );

          switch (axis) {
            case 'horizontal': {
              const newOrigin = transform.applyTo({
                x: selectedRect.x + currentX,
                y: 0,
              });
              currentX += layer.frame.width + gapX;
              layer.frame.x = newOrigin.x;
              break;
            }
            case 'vertical': {
              const newOrigin = transform.applyTo({
                x: 0,
                y: selectedRect.y + currentY,
              });
              currentY += layer.frame.height + gapY;
              layer.frame.y = newOrigin.y;
              break;
            }
          }
        });
      });
    }
    case 'alignLayers': {
      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);
      const selectedRect = getSelectedRect(state);
      const [, placement] = action;

      return produce(state, (state) => {
        const selectedBounds = createBounds(selectedRect);
        const midX = selectedRect.x + selectedRect.width / 2;
        const midY = selectedRect.y + selectedRect.height / 2;

        layerIndexPaths.forEach((layerIndexPath) => {
          const transform = getLayerTransformAtIndexPath(
            page,
            layerIndexPath,
            AffineTransform.identity,
          ).invert();
          const layer = Layers.access(
            state.sketch.pages[pageIndex], // access page again since we need to write to it
            layerIndexPath,
          );

          switch (placement) {
            case 'left': {
              const newOrigin = transform.applyTo({
                x: selectedBounds.minX,
                y: 0,
              });
              layer.frame.x = newOrigin.x;
              break;
            }
            case 'centerHorizontal': {
              const newOrigin = transform.applyTo({
                x: midX - layer.frame.width / 2,
                y: 0,
              });
              layer.frame.x = newOrigin.x;
              break;
            }
            case 'right': {
              const newOrigin = transform.applyTo({
                x: selectedBounds.maxX - layer.frame.width,
                y: 0,
              });
              layer.frame.x = newOrigin.x;
              break;
            }
            case 'top': {
              const newOrigin = transform.applyTo({
                x: 0,
                y: selectedBounds.minY,
              });
              layer.frame.y = newOrigin.y;
              break;
            }
            case 'centerVertical': {
              const newOrigin = transform.applyTo({
                x: 0,
                y: midY - layer.frame.height / 2,
              });
              layer.frame.y = newOrigin.y;
              break;
            }
            case 'bottom': {
              const newOrigin = transform.applyTo({
                x: 0,
                y: selectedBounds.maxY - layer.frame.height,
              });
              layer.frame.y = newOrigin.y;
              break;
            }
          }
        });
      });
    }
    case 'addNewBorder':
    case 'addNewFill':
    case 'addNewShadow':
    case 'setBorderEnabled':
    case 'setFillEnabled':
    case 'setShadowEnabled':
    case 'deleteBorder':
    case 'deleteFill':
    case 'deleteShadow':
    case 'moveBorder':
    case 'moveFill':
    case 'moveShadow':
    case 'deleteDisabledBorders':
    case 'deleteDisabledFills':
    case 'deleteDisabledShadows':
    case 'setBorderColor':
    case 'setFillColor':
    case 'setShadowColor':
    case 'setBorderWidth':
    case 'setFillOpacity':
    case 'setOpacity':
    case 'setShadowX':
    case 'setShadowY':
    case 'setShadowBlur':
    case 'setBorderPosition':
    case 'setShadowSpread': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      const currentTab = getCurrentTab(state);
      if (currentTab === 'canvas') {
        return produce(state, (state) => {
          accessPageLayers(state, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              if (!layer.style) return;

              layer.style = styleReducer(layer.style, action);
            },
          );
        });
      } else {
        const selectedLayerStyleIds = state.selectedLayerStyleIds;

        return produce(state, (state) => {
          const layerStyles = state.sketch.document.layerStyles?.objects ?? [];

          layerStyles.forEach((layerStyle) => {
            if (selectedLayerStyleIds.includes(layerStyle.do_objectID)) {
              layerStyle.value = styleReducer(layerStyle.value, action);
            }
          });
        });
      }
    }
    case 'setFixedRadius': {
      const [, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          if (layer._class === 'rectangle') {
            const newValue =
              mode === 'replace' ? amount : layer.fixedRadius + amount;

            layer.fixedRadius = Math.max(0, newValue);
          }
        });
      });
    }
    case 'setLayerRotation': {
      const [, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const rotation = getLayerRotation(layer);
          const newValue = mode === 'replace' ? amount : rotation + amount;

          layer.rotation = newValue * getLayerRotationMultiplier(layer);
        });
      });
    }
    case 'movePage': {
      const [, sourceIndex, destinationIndex] = action;

      return produce(state, (state) => {
        const sourceItem = state.sketch.pages[sourceIndex];

        state.sketch.pages.splice(sourceIndex, 1);
        state.sketch.pages.splice(destinationIndex, 0, sourceItem);
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
        action[1][0] === 'maybeScale' ? [...action[1], page] : action[1],
      );

      return produce(state, (state) => {
        state.interactionState = interactionState;

        switch (interactionState.type) {
          case 'moving': {
            const { previous, next } = interactionState;

            const delta = {
              x: next.x - previous.x,
              y: next.y - previous.y,
            };

            accessPageLayers(state, pageIndex, layerIndexPaths).forEach(
              (layer) => {
                layer.frame.x += delta.x;
                layer.frame.y += delta.y;
              },
            );

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
                state.sketch.pages[pageIndex],
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

            const meta: EncodedPageMetadata = state.sketch.user[currentPageId];

            const parsed = Primitives.parsePoint(meta.scrollOrigin);

            parsed.x += delta.x;
            parsed.y += delta.y;

            state.sketch.user[currentPageId] = {
              ...meta,
              scrollOrigin: Primitives.stringifyPoint(parsed),
            };

            break;
          }
        }
      });
    }
    case 'addColorSwatch': {
      return produce(state, (state) => {
        const sharedSwatches = state.sketch.document.sharedSwatches ?? {
          _class: 'swatchContainer',
          do_objectID: uuid(),
          objects: [],
        };

        const swatchColor: Sketch.Color = {
          _class: 'color',
          alpha: 1,
          red: 0,
          green: 0,
          blue: 0,
        };

        const swatch: Sketch.Swatch = {
          _class: 'swatch',
          do_objectID: uuid(),
          name: 'New Color Variable',
          value: swatchColor,
        };

        sharedSwatches.objects.push(swatch);
        state.sketch.document.sharedSwatches = sharedSwatches;
        state.selectedSwatchIds = [swatch.do_objectID];
      });
    }
    case 'selectSwatch': {
      const [, id, selectionType = 'replace'] = action;

      const ids = id === undefined ? [] : typeof id === 'string' ? [id] : id;
      return produce(state, (state) => {
        switch (selectionType) {
          case 'intersection':
            state.selectedSwatchIds.push(
              ...ids.filter((id) => !state.selectedSwatchIds.includes(id)),
            );
            return;
          case 'difference':
            ids.forEach((id) => {
              const selectedIndex = state.selectedSwatchIds.indexOf(id);
              state.selectedSwatchIds.splice(selectedIndex, 1);
            });
            return;
          case 'replace':
            state.selectedSwatchIds = [...ids];
            return;
        }
      });
    }
    case 'setSwatchColor': {
      const [, id, color] = action;

      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (state) => {
        const sharedSwatches =
          state.sketch.document.sharedSwatches?.objects ?? [];

        sharedSwatches.forEach((swatch: Sketch.Swatch) => {
          if (ids.includes(swatch.do_objectID)) {
            swatch.value = color;
          }
        });
      });
    }
    case 'setSwatchOpacity': {
      const [, id, alpha, mode = 'replace'] = action;

      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (state) => {
        const sharedSwatches =
          state.sketch.document.sharedSwatches?.objects ?? [];

        sharedSwatches.forEach((swatch: Sketch.Swatch) => {
          if (ids.includes(swatch.do_objectID)) {
            const newValue =
              mode === 'replace' ? alpha : swatch.value.alpha + alpha;

            swatch.value.alpha = Math.min(Math.max(0, newValue), 1);
          }
        });
      });
    }
    case 'addLayerStyle': {
      const [, name, style] = action;

      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        const layerStyles = state.sketch.document.layerStyles ?? {
          _class: 'sharedStyleContainer',
          do_objectID: uuid(),
          objects: [],
        };

        const sharedStyle: Sketch.SharedStyle = {
          _class: 'sharedStyle',
          do_objectID: uuid(),
          name: name === undefined || name === '' ? 'New Layer Style' : name,
          value: produce(
            style === undefined ? Models.style : style,
            (style) => {
              style.do_objectID = uuid();
              return style;
            },
          ),
        };

        layerStyles.objects.push(sharedStyle);
        state.sketch.document.layerStyles = layerStyles;

        if (style === undefined) {
          state.selectedLayerStyleIds = [sharedStyle.do_objectID];
        } else {
          accessPageLayers(state, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              if (!layer.style) return;

              layer.sharedStyleID = sharedStyle.do_objectID;
            },
          );
        }
      });
    }
    case 'selectLayerStyle': {
      const [, id, selectionType = 'replace'] = action;

      const ids = id === undefined ? [] : typeof id === 'string' ? [id] : id;
      return produce(state, (state) => {
        switch (selectionType) {
          case 'intersection':
            state.selectedLayerStyleIds.push(
              ...ids.filter((id) => !state.selectedLayerStyleIds.includes(id)),
            );
            return;
          case 'difference':
            ids.forEach((id) => {
              const selectedIndex = state.selectedLayerStyleIds.indexOf(id);
              state.selectedLayerStyleIds.splice(selectedIndex, 1);
            });
            return;
          case 'replace':
            state.selectedLayerStyleIds = [...ids];
            return;
        }
      });
    }
    case 'setLayerStyleName':
    case 'setSwatchName': {
      const [, id, name] = action;

      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (state) => {
        const array =
          action[0] === 'setSwatchName'
            ? state.sketch.document.sharedSwatches?.objects ?? []
            : state.sketch.document.layerStyles?.objects ?? [];

        array.forEach((object: Sketch.Swatch | Sketch.SharedStyle) => {
          if (ids.includes(object.do_objectID)) {
            object.name = name;
          }
        });
      });
    }
    case 'setLayerStyle': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      const [, id, style] = action;

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          if (!layer.style) return;

          if (style) {
            layer.sharedStyleID = id;
            layer.style = produce(style, (style) => {
              style.do_objectID = uuid();
              return style;
            });
          } else {
            layer.sharedStyleID = undefined;
          }
        });
      });
    }
    case 'updateLayerStyle': {
      const [, id, style] = action;

      return produce(state, (state) => {
        if (!style) return;

        const sharedStyle = state.sketch.document.layerStyles.objects;

        sharedStyle.forEach((SStyle: Sketch.SharedStyle) => {
          if (id === SStyle.do_objectID) {
            SStyle.value = produce(style, (style) => {
              style.do_objectID = uuid();
              return style;
            });
          }
        });
      });
    }
    case 'removeSwatch': {
      const ids = state.selectedSwatchIds;

      return produce(state, (state) => {
        const sharedSwatches = state.sketch.document.sharedSwatches;

        if (!sharedSwatches) return;

        const filterSwatches = sharedSwatches.objects.filter(
          (object: Sketch.Swatch) => !ids.includes(object.do_objectID),
        );
        sharedSwatches.objects = filterSwatches;

        state.sketch.document.sharedSwatches = sharedSwatches;
      });
    }
    case 'removeLayerStyle': {
      const ids = state.selectedLayerStyleIds;

      return produce(state, (state) => {
        const layerStyles = state.sketch.document.layerStyles;

        if (!layerStyles) return;

        const filterLayer = layerStyles.objects.filter(
          (object: Sketch.SharedStyle) => !ids.includes(object.do_objectID),
        );
        layerStyles.objects = filterLayer;

        state.sketch.document.layerStyles = layerStyles;
      });
    }
    default:
      return state;
  }
}

/**
 * Get an array of all layers using as few lookups as possible on the state tree.
 *
 * Immer will duplicate any objects we access within a produce method, so we
 * don't want to walk every layer, since that would duplicate all of them.
 */
function accessPageLayers(
  state: WritableDraft<ApplicationState>,
  pageIndex: number,
  layerIndexPaths: IndexPath[],
): Sketch.AnyLayer[] {
  return layerIndexPaths.map((layerIndex) => {
    return Layers.access(state.sketch.pages[pageIndex], layerIndex);
  });
}

export function createInitialState(sketch: SketchFile): ApplicationState {
  if (sketch.pages.length === 0) {
    throw new Error('Invalid Sketch file - no pages');
  }

  return {
    currentTab: 'canvas',
    currentThemeTab: 'swatches',
    interactionState: createInitialInteractionState(),
    selectedPage: sketch.pages[0].do_objectID,
    selectedObjects: [],
    selectedSwatchIds: [],
    selectedLayerStyleIds: [],
    highlightedLayer: undefined,
    sketch,
    canvasSize: { width: 0, height: 0 },
    canvasInsets: { left: 0, right: 0 },
    preferences: {
      showRulers: false,
    },
  };
}
