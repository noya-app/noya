import Sketch from '@sketch-hq/sketch-file-format-ts';
import { Primitives, uuid } from 'noya-renderer';
import { getBoundingRect } from 'noya-renderer/src/canvas/selection';
import {
  createBounds,
  normalizeRect,
  resizeRect,
} from 'noya-renderer/src/primitives';
import { SketchFile } from 'noya-sketch-file';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { IndexPath } from 'tree-visit';
import * as Layers from '../layers';
import * as Models from '../models';
import {
  EncodedPageMetadata,
  getCurrentPage,
  getCurrentPageIndex,
  getCurrentPageMetadata,
  getSelectedLayerIndexPaths,
  getSelectedLayerIndexPathsExcludingDescendants,
  getSelectedRect,
} from '../selectors';
import { Bounds, Point, UUID } from '../types';
import { AffineTransform } from '../utils/AffineTransform';
import {
  CompassDirection,
  createInitialInteractionState,
  InteractionAction,
  interactionReducer,
  InteractionState,
} from './interaction';

export type WorkspaceTab = 'canvas' | 'components';

export type LayerHighlightPrecedence = 'aboveSelection' | 'belowSelection';

export type LayerHighlight = {
  id: string;
  precedence: LayerHighlightPrecedence;
};

export type ApplicationState = {
  currentTab: WorkspaceTab;
  interactionState: InteractionState;
  selectedPage: string;
  highlightedLayer?: LayerHighlight;
  selectedObjects: string[];
  selectedSwatchIds: string[];
  sketch: SketchFile;
  canvasSize: { width: number; height: number };
  canvasInsets: { left: number; right: number };
};

export type SelectionType = 'replace' | 'intersection' | 'difference';

export type SetNumberMode = 'replace' | 'adjust';

type StyleElementType = 'Fill' | 'Border' | 'Shadow';

export type Action =
  | [type: 'setTab', value: WorkspaceTab]
  | [
      type: 'setCanvasSize',
      size: { width: number; height: number },
      insets: { left: number; right: number },
    ]
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
  | [type: `addNew${StyleElementType}`]
  | [type: `delete${StyleElementType}`, index: number]
  | [
      type: `move${StyleElementType}`,
      sourceIndex: number,
      destinationIndex: number,
    ]
  | [type: `deleteDisabled${StyleElementType}s`]
  | [type: `set${StyleElementType}Enabled`, index: number, isEnabled: boolean]
  | [
      type: 'setBorderWidth',
      index: number,
      amount: number,
      mode?: SetNumberMode,
    ]
  | [type: 'setBorderPosition', index: number, position: Sketch.BorderPosition]
  | [
      type: 'setFillOpacity',
      index: number,
      amount: number,
      mode?: SetNumberMode,
    ]
  | [type: 'setShadowX', index: number, amount: number, mode?: SetNumberMode]
  | [type: 'setShadowY', index: number, amount: number, mode?: SetNumberMode]
  | [type: 'setShadowBlur', index: number, amount: number, mode?: SetNumberMode]
  | [
      type: 'setShadowSpread',
      index: number,
      amount: number,
      mode?: SetNumberMode,
    ]
  | [type: 'setOpacity', amount: number, mode?: SetNumberMode]
  | [type: 'setFixedRadius', amount: number, mode?: SetNumberMode]
  | [type: `set${StyleElementType}Color`, index: number, value: Sketch.Color]
  | [
      type: 'setSwatchColor', 
      id: string | string[],
      color: Sketch.Color
    ]
  | [
      type: 'setSwatchName', 
      id: string | string[],
      name: string
    ]
  | [
      type: 'setSwatchOpacity', 
      id: string | string[],
      alpha: number,
      mode?: 'replace' | 'adjust'
    ]
  | [
      type: 'addColorSwatch',
    ]
  | [
      type: 'interaction',
      // Some actions may need to be augmented by additional state before
      // being passed to nested reducers (e.g. `maybeScale` takes a snapshot
      // of the current page). Maybe there's a better way? This still seems
      // better than moving the whole reducer up into the parent.
      action:
        | Exclude<InteractionAction, ['maybeScale', ...any[]]>
        | [type: 'maybeScale', origin: Point, direction: CompassDirection],
    ];

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
    case 'setCanvasSize': {
      const [, size, insets] = action;

      return produce(state, (state) => {
        state.canvasSize = size;
        state.canvasInsets = insets;
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
        const combinedWidths = layers.reduce(
          (width, layer) => layer.frame.width + width,
          0,
        );
        const combinedHeights = layers.reduce(
          (height, layer) => layer.frame.height + height,
          0,
        );
        const differenceWidth = selectedRect.width - combinedWidths;
        const differenceHeight = selectedRect.height - combinedHeights;
        const gapX = differenceWidth / (layers.length - 1);
        const gapY = differenceHeight / (layers.length - 1);
        const sortBy = axis === 'horizontal' ? 'minX' : 'minY'; // TODO: sort by mid point once it's available
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
    case 'addNewShadow': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (!style) return;

          switch (action[0]) {
            case 'addNewBorder':
              if (style.borders) {
                style.borders.unshift(Models.border);
              } else {
                style.borders = [Models.border];
              }
              break;
            case 'addNewFill':
              if (style.fills) {
                style.fills.unshift(Models.fill);
              } else {
                style.fills = [Models.fill];
              }
              break;
            case 'addNewShadow':
              if (style.shadows) {
                style.shadows.unshift(Models.shadow);
              } else {
                style.shadows = [Models.shadow];
              }
              break;
          }
        });
      });
    }
    case 'setBorderEnabled':
    case 'setFillEnabled':
    case 'setShadowEnabled': {
      const [, index, isEnabled] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (!style) return;

          switch (action[0]) {
            case 'setBorderEnabled':
              if (style.borders && style.borders[index]) {
                style.borders[index].isEnabled = isEnabled;
              }
              break;
            case 'setFillEnabled':
              if (style.fills && style.fills[index]) {
                style.fills[index].isEnabled = isEnabled;
              }
              break;
            case 'setShadowEnabled':
              if (style.shadows && style.shadows[index]) {
                style.shadows[index].isEnabled = isEnabled;
              }
              break;
          }
        });
      });
    }
    case 'deleteBorder':
    case 'deleteFill':
    case 'deleteShadow': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (!style) return;

          switch (action[0]) {
            case 'deleteBorder':
              if (style.borders) {
                style.borders.splice(action[1], 1);
              }
              break;
            case 'deleteFill':
              if (style.fills) {
                style.fills.splice(action[1], 1);
              }
              break;
            case 'deleteShadow':
              if (style.shadows) {
                style.shadows.splice(action[1], 1);
              }
              break;
          }
        });
      });
    }
    case 'moveBorder':
    case 'moveFill':
    case 'moveShadow': {
      const [, sourceIndex, destinationIndex] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (!style) return;

          switch (action[0]) {
            case 'moveBorder':
              if (style.borders) {
                const sourceItem = style.borders[sourceIndex];

                style.borders.splice(sourceIndex, 1);
                style.borders.splice(destinationIndex, 0, sourceItem);
              }
              break;
            case 'moveFill':
              if (style.fills) {
                const sourceItem = style.fills[sourceIndex];

                style.fills.splice(sourceIndex, 1);
                style.fills.splice(destinationIndex, 0, sourceItem);
              }
              break;
            case 'moveShadow':
              if (style.shadows) {
                const sourceItem = style.shadows[sourceIndex];

                style.shadows.splice(sourceIndex, 1);
                style.shadows.splice(destinationIndex, 0, sourceItem);
              }
              break;
          }
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
    case 'deleteDisabledBorders':
    case 'deleteDisabledFills':
    case 'deleteDisabledShadows': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (!style) return;

          switch (action[0]) {
            case 'deleteDisabledBorders':
              if (style.borders) {
                style.borders = style.borders.filter(
                  (border) => border.isEnabled,
                );
              }
              break;
            case 'deleteDisabledFills':
              if (style.fills) {
                style.fills = style.fills.filter((fill) => fill.isEnabled);
              }
              break;
            case 'deleteDisabledShadows':
              if (style.shadows) {
                style.shadows = style.shadows.filter((fill) => fill.isEnabled);
              }
              break;
          }
        });
      });
    }
    case 'setBorderColor':
    case 'setFillColor':
    case 'setShadowColor': {
      const [, index, color] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (!style) return;

          switch (action[0]) {
            case 'setBorderColor':
              if (style.borders && style.borders[index]) {
                style.borders[index].color = color;
              }
              break;
            case 'setFillColor':
              if (style.fills && style.fills[index]) {
                style.fills[index].color = color;
              }
              break;
            case 'setShadowColor':
              if (style.shadows && style.shadows[index]) {
                style.shadows[index].color = color;
              }
              break;
          }
        });
      });
    }
    case 'setBorderWidth': {
      const [, index, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (style && style.borders && style.borders[index]) {
            const newValue =
              mode === 'replace'
                ? amount
                : style.borders[index].thickness + amount;

            style.borders[index].thickness = Math.max(0, newValue);
          }
        });
      });
    }
    case 'setFillOpacity': {
      const [, index, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (style && style.fills && style.fills[index]) {
            const newValue =
              mode === 'replace'
                ? amount
                : style.fills[index].color.alpha + amount;

            style.fills[index].color.alpha = Math.min(Math.max(0, newValue), 1);
          }
        });
      });
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
    case 'setOpacity': {
      const [, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (style && style.contextSettings) {
            const newValue =
              mode === 'replace'
                ? amount
                : style.contextSettings.opacity + amount;

            style.contextSettings.opacity = Math.min(Math.max(0, newValue), 1);
          }
        });
      });
    }
    case 'setShadowX': {
      const [, index, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (style && style.shadows && style.shadows[index]) {
            const newValue =
              mode === 'replace'
                ? amount
                : style.shadows[index].offsetX + amount;

            style.shadows[index].offsetX = newValue;
          }
        });
      });
    }
    case 'setShadowY': {
      const [, index, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (style && style.shadows && style.shadows[index]) {
            const newValue =
              mode === 'replace'
                ? amount
                : style.shadows[index].offsetY + amount;

            style.shadows[index].offsetY = newValue;
          }
        });
      });
    }
    case 'setShadowBlur': {
      const [, index, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (style && style.shadows && style.shadows[index]) {
            const newValue =
              mode === 'replace'
                ? amount
                : style.shadows[index].blurRadius + amount;

            style.shadows[index].blurRadius = newValue;
          }
        });
      });
    }
    case 'setBorderPosition': {
      const [, index, position] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (style && style.borders && style.borders[index]) {
            style.borders[index].position = position;
          }
        });
      });
    }
    case 'setShadowSpread': {
      const [, index, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (state) => {
        accessPageLayers(state, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = layer.style;

          if (style && style.shadows && style.shadows[index]) {
            const newValue =
              mode === 'replace'
                ? amount
                : style.shadows[index].spread + amount;

            style.shadows[index].spread = newValue;
          }
        });
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
              AffineTransform.scale(
                originalBoundingRect.width,
                originalBoundingRect.height,
              ),
              AffineTransform.translation(
                originalBoundingRect.x,
                originalBoundingRect.y,
              ),
            ).invert();

            const newTransform = AffineTransform.multiply(
              AffineTransform.scale(
                newBoundingRect.width,
                newBoundingRect.height,
              ),
              AffineTransform.translation(newBoundingRect.x, newBoundingRect.y),
            );

            layerIndexPaths.forEach((layerIndex) => {
              const originalLayer = Layers.access(pageSnapshot, layerIndex);

              const layerTransform = AffineTransform.multiply(
                ...Layers.accessPath(pageSnapshot, layerIndex)
                  .slice(1, -1) // Remove the page and current layer
                  .map((layer) =>
                    AffineTransform.translation(layer.frame.x, layer.frame.y),
                  ),
              );

              const newLayer = Layers.access(
                state.sketch.pages[pageIndex],
                layerIndex,
              );

              const min = AffineTransform.multiply(
                layerTransform,
                originalTransform,
                newTransform,
                layerTransform.invert(),
              ).applyTo({
                x: originalLayer.frame.x,
                y: originalLayer.frame.y,
              });

              const max = AffineTransform.multiply(
                layerTransform,
                originalTransform,
                newTransform,
                layerTransform.invert(),
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
          "_class": "swatchContainer",
          "do_objectID": uuid(),
          "objects" : []
        }

        const swatchColor: Sketch.Color = {
          "_class": "color",
          "alpha": 0.5,
          "red": 0,
          "green": 0,
          "blue": 0
        }
        
        const swatch: Sketch.Swatch = {
          "_class": "swatch",
          "do_objectID": uuid(),
          "name": "New Color Variable",
          "value": swatchColor,
        }

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
        const sharedSwatches = state.sketch.document.sharedSwatches?.objects ?? []

        sharedSwatches.forEach((swatch: Sketch.Swatch) => {
          if ( ids.includes(swatch.do_objectID) ){
            swatch.value = color;
          }
        });
      });
    }
    case 'setSwatchName': {
      const [, id, name] = action;

      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (state) => {
        const sharedSwatches = state.sketch.document.sharedSwatches?.objects ?? []

        sharedSwatches.forEach((swatch: Sketch.Swatch) => {
          if ( ids.includes(swatch.do_objectID) ){
            swatch.name = name;
          }
        });
      });
    }
    case 'setSwatchOpacity': {
      const [, id, alpha, mode = 'replace'] = action;

      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (state) => {
        const sharedSwatches = state.sketch.document.sharedSwatches?.objects ?? []

        sharedSwatches.forEach((swatch: Sketch.Swatch) => {
          if ( ids.includes(swatch.do_objectID) ){
            const newValue =
              mode === 'replace'
                ? alpha
                : swatch.value.alpha + alpha;
            
            swatch.value.alpha = Math.min(Math.max(0, newValue), 1);
          }
        });
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

function getLayerTransformAtIndexPath(
  node: Sketch.AnyLayer,
  indexPath: IndexPath,
) {
  return AffineTransform.multiply(
    ...Layers.accessPath(node, indexPath)
      .slice(1, -1) // Remove the page and current layer
      .map((layer) =>
        AffineTransform.translation(layer.frame.x, layer.frame.y),
      ),
  );
}

function getNormalizedBounds(
  page: Sketch.Page,
  layerIndexPath: IndexPath,
): Bounds {
  const layer = Layers.access(page, layerIndexPath);
  const transform = getLayerTransformAtIndexPath(page, layerIndexPath);
  return Primitives.createBounds(
    Primitives.transformRect(layer.frame, transform),
  );
}

export function createInitialState(sketch: SketchFile): ApplicationState {
  if (sketch.pages.length === 0) {
    throw new Error('Invalid Sketch file - no pages');
  }

  return {
    currentTab: 'canvas',
    interactionState: createInitialInteractionState(),
    selectedPage: sketch.pages[0].do_objectID,
    selectedObjects: [],
    selectedSwatchIds: [],
    highlightedLayer: undefined,
    sketch,
    canvasSize: { width: 0, height: 0 },
    canvasInsets: { left: 0, right: 0 },
  };
}
