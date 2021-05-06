import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { Primitives, SimpleTextDecoration, uuid } from 'noya-renderer';
import { resizeRect } from 'noya-renderer/src/primitives';
import { SketchFile } from 'noya-sketch-file';
import { sum, getIncrementedName, delimitedPath } from 'noya-utils';
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
  findPageLayerIndexPaths,
  visitStyleColors,
  visitLayerColors,
  getCurrentComponentsTab,
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
import {
  StringAttributeAction,
  stringAttributeReducer,
} from './stringAttribute';

export type { SetNumberMode };

export type WorkspaceTab = 'canvas' | 'theme';

export type ThemeTab = 'swatches' | 'textStyles' | 'layerStyles' | 'symbols';

export type ComponentsElements = 'Swatch' | 'TextStyle' | 'ThemeStyle';

export type ApplicationState = {
  currentTab: WorkspaceTab;
  currentThemeTab: ThemeTab;
  interactionState: InteractionState;
  selectedPage: string;
  selectedObjects: string[];
  selectedSwatchIds: string[];
  selectedLayerStyleIds: string[];
  selectedTextStyleIds: string[];
  selectedSwatchGroup: string;
  selectedTextStyleGroup: string;
  selectedThemeStyleGroup: string;
  sketch: SketchFile;
};

export type SelectionType = 'replace' | 'intersection' | 'difference';

export type Action =
  | [type: 'setTab', value: WorkspaceTab]
  | [type: 'setThemeTab', value: ThemeTab]
  | [type: 'movePage', sourceIndex: number, destinationIndex: number]
  | [
      type: 'insertArtboard',
      details: { name: string; width: number; height: number },
    ]
  | [type: 'addDrawnLayer']
  | [type: 'deleteLayer', layerId: string | string[]]
  | [
      type: 'selectLayer',
      layerId: string | string[] | undefined,
      selectionType?: SelectionType,
    ]
  | [
      type: `select${ComponentsElements}`,
      id: string | string[] | undefined,
      selectionType?: SelectionType,
    ]
  | [type: 'setLayerVisible', layerId: string | string[], visible: boolean]
  | [type: 'setExpandedInLayerList', layerId: string, expanded: boolean]
  | [type: 'selectPage', pageId: UUID]
  | [type: 'addPage', name: string]
  | [type: 'deletePage']
  | [type: 'renamePage', name: string]
  | [type: 'duplicatePage']
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
  | [type: 'setSwatchColor', swatchId: string | string[], color: Sketch.Color]
  | [
      type: 'setSwatchOpacity',
      swatchId: string | string[],
      alpha: number,
      mode?: SetNumberMode,
    ]
  | [type: `add${ComponentsElements}`, name?: string, style?: Sketch.Style]
  | [
      type: 'updateThemeStyle',
      sharedStyleId: string,
      style: Sketch.Style | undefined,
    ]
  | [type: `duplicate${ComponentsElements}`, id: string[]]
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
  | [
      type: `set${ComponentsElements}Name`,
      swatchId: string | string[],
      name: string,
    ]
  | [type: `remove${ComponentsElements}`]
  | [type: `setSelected${ComponentsElements}Group`, groupId: string]
  | [
      type: 'groupSwatches',
      swatchId: string | string[],
      name: string | undefined,
    ]
  | [
      type: 'groupThemeStyles',
      swatchId: string | string[],
      name: string | undefined,
    ]
  | [
      type: 'groupTextStyles',
      swatchId: string | string[],
      name: string | undefined,
    ]
  | [
      type: 'setThemeStyle',
      sharedStyleId?: string,
      style?: Sketch.Style | undefined,
    ]
  | StyleAction
  | StringAttributeAction
  | [type: 'setTextAlignment', value: number]
  | [type: 'setTextDecoration', value: SimpleTextDecoration]
  | [type: 'setTextTransform', value: number];

export function reducer(
  state: ApplicationState,
  action: Action,
): ApplicationState {
  switch (action[0]) {
    case 'setTab': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.currentTab = value;
        draft.interactionState = interactionReducer(draft.interactionState, [
          'reset',
        ]);
      });
    }
    case 'setThemeTab': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.currentThemeTab = value;
      });
    }
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
    case 'setLayerVisible': {
      const [, id, visible] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPaths = Layers.findAllIndexPaths(page, (layer) =>
        ids.includes(layer.do_objectID),
      );

      return produce(state, (draft) => {
        const layers = accessPageLayers(draft, pageIndex, indexPaths);

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

      return produce(state, (draft) => {
        const layer = Layers.access(draft.sketch.pages[pageIndex], indexPath);

        layer.layerListExpandedType = expanded
          ? Sketch.LayerListExpanded.Expanded
          : Sketch.LayerListExpanded.Collapsed;
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
    case 'deleteLayer': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPaths = Layers.findAllIndexPaths(page, (layer) =>
        ids.includes(layer.do_objectID),
      );

      // We delete in reverse so that the indexPaths remain accurate even
      // after some layers are deleted.
      const reversed = [...indexPaths.reverse()];

      return produce(state, (draft) => {
        reversed.forEach((indexPath) => {
          const childIndex = indexPath[indexPath.length - 1];
          const parent = Layers.access(
            draft.sketch.pages[pageIndex],
            indexPath.slice(0, -1),
          ) as Layers.ParentLayer;
          parent.layers.splice(childIndex, 1);
        });
      });
    }
    case 'selectLayer': {
      const [, id, selectionType = 'replace'] = action;

      const ids = id === undefined ? [] : typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        switch (selectionType) {
          case 'intersection':
            draft.selectedObjects.push(
              ...ids.filter((id) => !draft.selectedObjects.includes(id)),
            );
            return;
          case 'difference':
            ids.forEach((id) => {
              const selectedIndex = draft.selectedObjects.indexOf(id);
              draft.selectedObjects.splice(selectedIndex, 1);
            });
            return;
          case 'replace':
            draft.selectedObjects = [...ids];
            return;
        }
      });
    }
    case 'selectPage': {
      return produce(state, (draft) => {
        draft.selectedPage = action[1];
      });
    }
    case 'addPage': {
      const [, name] = action;

      return produce(state, (draft) => {
        const pages = draft.sketch.pages;
        const user = draft.sketch.user;

        const newPage: Sketch.Page = produce(Models.page, (page) => {
          page.do_objectID = uuid();
          page.name = name || `Page ${pages.length + 1}`;
          return page;
        });

        user[newPage.do_objectID] = {
          scrollOrigin: '{0, 0}',
          zoomValue: 1,
        };

        pages.push(newPage);

        draft.selectedPage = newPage.do_objectID;
      });
    }
    case 'renamePage': {
      const [, name] = action;
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (draft) => {
        const pages = draft.sketch.pages;
        const page = pages[pageIndex];

        pages[pageIndex] = produce(page, (page) => {
          page.name = name || `Page ${pages.length + 1}`;
          return page;
        });
      });
    }
    case 'duplicatePage': {
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (draft) => {
        const pages = draft.sketch.pages;
        const user = draft.sketch.user;
        const page = pages[pageIndex];

        const duplicatePage = produce(page, (page) => {
          page.name = `${page.name} Copy`;

          Layers.visit(page, (layer) => {
            layer.do_objectID = uuid();
            if (layer.style) layer.style.do_objectID = uuid();
          });

          return page;
        });

        user[duplicatePage.do_objectID] = {
          scrollOrigin: user[page.do_objectID].scrollOrigin,
          zoomValue: user[page.do_objectID].zoomValue,
        };

        pages.push(duplicatePage);
        draft.selectedPage = duplicatePage.do_objectID;
      });
    }
    case 'deletePage': {
      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (draft) => {
        const pages = draft.sketch.pages;
        const user = draft.sketch.user;

        delete user[page.do_objectID];
        pages.splice(pageIndex, 1);

        const newIndex = Math.max(pageIndex - 1, 0);
        draft.selectedPage = pages[newIndex].do_objectID;
      });
    }
    case 'distributeLayers': {
      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);
      const selectedRect = getSelectedRect(state);
      const [, axis] = action;

      return produce(state, (draft) => {
        const layers = accessPageLayers(draft, pageIndex, layerIndexPaths);
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
            draft.sketch.pages[pageIndex], // access page again since we need to write to it
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

      return produce(state, (draft) => {
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
            draft.sketch.pages[pageIndex], // access page again since we need to write to it
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

      const ids = state.selectedLayerStyleIds;

      const layerIndexPathsWithSharedStyle = findPageLayerIndexPaths(
        state,
        (layer) =>
          layer.sharedStyleID !== undefined &&
          ids.includes(layer.sharedStyleID),
      );

      const currentTab = getCurrentTab(state);
      if (currentTab === 'canvas') {
        return produce(state, (draft) => {
          accessPageLayers(draft, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              if (!layer.style) return;

              layer.style = styleReducer(layer.style, action);
            },
          );
        });
      } else {
        const currentComponentsTab = getCurrentComponentsTab(state);
        const selectedIds =
          currentComponentsTab === 'layerStyles'
            ? state.selectedLayerStyleIds
            : state.selectedTextStyleIds;

        return produce(state, (draft) => {
          const styles =
            currentComponentsTab === 'layerStyles'
              ? draft.sketch.document.layerStyles?.objects
              : draft.sketch.document.layerTextStyles?.objects ?? [];

          styles.forEach((style) => {
            if (!selectedIds.includes(style.do_objectID)) return;

            style.value = styleReducer(style.value, action);

            if (currentComponentsTab === 'textStyles') return;
            layerIndexPathsWithSharedStyle.forEach((layerPath) =>
              accessPageLayers(
                draft,
                layerPath.pageIndex,
                layerPath.indexPaths,
              ).forEach((layer) => {
                layer.style = produce(style.value, (style) => {
                  style.do_objectID = uuid();
                  return style;
                });
              }),
            );
          });
        });
      }
    }
    case 'setFixedRadius': {
      const [, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          if (layer._class !== 'rectangle') return;

          const newValue =
            mode === 'replace' ? amount : layer.fixedRadius + amount;

          layer.fixedRadius = Math.max(0, newValue);
        });
      });
    }
    case 'setLayerRotation': {
      const [, amount, mode = 'replace'] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          const rotation = getLayerRotation(layer);
          const newValue = mode === 'replace' ? amount : rotation + amount;

          layer.rotation = newValue * getLayerRotationMultiplier(layer);
        });
      });
    }
    case 'movePage': {
      const [, sourceIndex, destinationIndex] = action;

      return produce(state, (draft) => {
        const sourceItem = draft.sketch.pages[sourceIndex];

        draft.sketch.pages.splice(sourceIndex, 1);
        draft.sketch.pages.splice(destinationIndex, 0, sourceItem);
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
      return produce(state, (draft) => {
        draft.interactionState = interactionState;

        switch (interactionState.type) {
          case 'moving': {
            const { previous, next } = interactionState;

            const delta = {
              x: next.x - previous.x,
              y: next.y - previous.y,
            };

            accessPageLayers(draft, pageIndex, layerIndexPaths).forEach(
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
    case 'addSwatch': {
      return produce(state, (draft) => {
        const sharedSwatches = draft.sketch.document.sharedSwatches ?? {
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
          name: delimitedPath.join([
            draft.selectedSwatchGroup,
            'New Theme Color',
          ]),
          value: swatchColor,
        };

        sharedSwatches.objects.push(swatch);
        draft.sketch.document.sharedSwatches = sharedSwatches;
        draft.selectedSwatchIds = [swatch.do_objectID];
      });
    }
    case 'addTextStyle': {
      const [, name, style] = action;

      return produce(state, (draft) => {
        const textStyles = draft.sketch.document.layerTextStyles ?? {
          _class: 'sharedTextStyleContainer',
          do_objectID: uuid(),
          objects: [],
        };

        const sharedStyle: Sketch.SharedStyle = {
          _class: 'sharedStyle',
          do_objectID: uuid(),
          name: delimitedPath.join([
            draft.selectedTextStyleGroup,
            name || 'New Text Style',
          ]),
          value: produce(style || Models.style, (style) => {
            style.do_objectID = uuid();
            return style;
          }),
        };

        textStyles.objects.push(sharedStyle);
        draft.sketch.document.layerTextStyles = textStyles;
      });
    }
    case 'addThemeStyle': {
      const [, name, style] = action;

      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      const currentTab = state.currentTab;
      return produce(state, (draft) => {
        const layerStyles = draft.sketch.document.layerStyles ?? {
          _class: 'sharedStyleContainer',
          do_objectID: uuid(),
          objects: [],
        };

        const sharedStyle: Sketch.SharedStyle = {
          _class: 'sharedStyle',
          do_objectID: uuid(),
          name: delimitedPath.join([
            draft.selectedThemeStyleGroup,
            name || 'New Layer Style',
          ]),
          value: produce(style || Models.style, (style) => {
            style.do_objectID = uuid();
            return style;
          }),
        };
        layerStyles.objects.push(sharedStyle);
        draft.sketch.document.layerStyles = layerStyles;

        if (currentTab === 'theme') {
          draft.selectedLayerStyleIds = [sharedStyle.do_objectID];
        } else {
          accessPageLayers(draft, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              layer.sharedStyleID = sharedStyle.do_objectID;
            },
          );
        }
      });
    }
    case 'duplicateSwatch': {
      const [, id] = action;
      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        const sharedSwatches = draft.sketch.document.sharedSwatches ?? {
          _class: 'swatchContainer',
          do_objectID: uuid(),
          objects: [],
        };

        sharedSwatches.objects.forEach((swatch: Sketch.Swatch) => {
          if (!ids.includes(swatch.do_objectID)) return;
          const swatchColor = swatch.value;

          const newSwatch: Sketch.Swatch = {
            _class: 'swatch',
            do_objectID: uuid(),
            name: getIncrementedName(
              swatch.name,
              sharedSwatches.objects.map((s) => s.name),
            ),
            value: swatchColor,
          };

          sharedSwatches.objects.push(newSwatch);
        });
        draft.sketch.document.sharedSwatches = sharedSwatches;
      });
    }
    case 'duplicateThemeStyle': {
      const [, id] = action;
      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        const layerStyles = draft.sketch.document.layerStyles ?? {
          _class: 'sharedStyleContainer',
          do_objectID: uuid(),
          objects: [],
        };

        layerStyles.objects.forEach((sharedStyle: Sketch.SharedStyle) => {
          if (!ids.includes(sharedStyle.do_objectID)) return;

          const newSharedStyle: Sketch.SharedStyle = {
            _class: 'sharedStyle',
            do_objectID: uuid(),
            name: getIncrementedName(
              sharedStyle.name,
              layerStyles.objects.map((s) => s.name),
            ),
            value: produce(sharedStyle.value, (style) => {
              style.do_objectID = uuid();
              return style;
            }),
          };

          layerStyles.objects.push(newSharedStyle);
        });

        draft.sketch.document.layerStyles = layerStyles;
      });
    }
    case 'duplicateTextStyle': {
      const [, id] = action;
      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        const textStyles = draft.sketch.document.layerTextStyles ?? {
          _class: 'sharedTextStyleContainer',
          do_objectID: uuid(),
          objects: [],
        };

        textStyles.objects.forEach((sharedStyle: Sketch.SharedStyle) => {
          if (!ids.includes(sharedStyle.do_objectID)) return;

          const newSharedStyle: Sketch.SharedStyle = {
            _class: 'sharedStyle',
            do_objectID: uuid(),
            name: getIncrementedName(
              sharedStyle.name,
              textStyles.objects.map((s) => s.name),
            ),
            value: produce(sharedStyle.value, (style) => {
              style.do_objectID = uuid();
              return style;
            }),
          };

          textStyles.objects.push(newSharedStyle);
        });

        draft.sketch.document.layerTextStyles = textStyles;
      });
    }
    case 'selectSwatch':
    case 'selectThemeStyle':
    case 'selectTextStyle': {
      const [, id, selectionType = 'replace'] = action;

      const ids = id === undefined ? [] : typeof id === 'string' ? [id] : id;
      return produce(state, (draft) => {
        const draftIds =
          selectionType === 'replace'
            ? [...ids]
            : action[0] === 'selectSwatch'
            ? draft.selectedSwatchIds
            : action[0] === 'selectThemeStyle'
            ? draft.selectedLayerStyleIds
            : draft.selectedTextStyleIds;

        switch (selectionType) {
          case 'intersection':
            draftIds.push(...ids.filter((id) => !draftIds.includes(id)));
            break;
          case 'difference':
            ids.forEach((id) => {
              const selectedIndex = draftIds.indexOf(id);
              draftIds.splice(selectedIndex, 1);
            });
            break;
        }

        switch (action[0]) {
          case 'selectSwatch': {
            draft.selectedSwatchIds = draftIds;
            return;
          }
          case 'selectThemeStyle': {
            draft.selectedLayerStyleIds = draftIds;
            return;
          }
          case 'selectTextStyle': {
            draft.selectedTextStyleIds = draftIds;
            return;
          }
        }
      });
    }
    case 'setSwatchColor': {
      const [, id, color] = action;

      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        const sharedSwatches =
          draft.sketch.document.sharedSwatches?.objects ?? [];

        const sharedStyles = draft.sketch.document.layerStyles.objects;

        sharedSwatches.forEach((swatch: Sketch.Swatch) => {
          if (!ids.includes(swatch.do_objectID)) return;

          swatch.value = color;

          const changeColor = (c: Sketch.Color) => {
            if (c.swatchID !== swatch.do_objectID) return;

            c.alpha = color.alpha;
            c.red = color.red;
            c.blue = color.blue;
            c.green = color.green;
          };

          draft.sketch.pages.forEach((page) => {
            Layers.visit(page, (layer) => {
              visitLayerColors(layer, changeColor);
            });
          });

          sharedStyles.forEach((sharedStyle) => {
            if (!sharedStyle.value) return;
            visitStyleColors(sharedStyle.value, changeColor);
          });
        });
      });
    }
    case 'setSwatchOpacity': {
      const [, id, alpha, mode = 'replace'] = action;

      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        const sharedSwatches =
          draft.sketch.document.sharedSwatches?.objects ?? [];

        sharedSwatches.forEach((swatch: Sketch.Swatch) => {
          if (!ids.includes(swatch.do_objectID)) return;

          const newValue =
            mode === 'replace' ? alpha : swatch.value.alpha + alpha;

          swatch.value.alpha = Math.min(Math.max(0, newValue), 1);
        });
      });
    }
    case 'setThemeStyleName':
    case 'setTextStyleName':
    case 'setSwatchName': {
      const [, id, name] = action;

      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        const array =
          action[0] === 'setSwatchName'
            ? draft.sketch.document.sharedSwatches?.objects ?? []
            : action[0] === 'setTextStyleName'
            ? draft.sketch.document.layerTextStyles?.objects ?? []
            : draft.sketch.document.layerStyles?.objects ?? [];

        array.forEach((object: Sketch.Swatch | Sketch.SharedStyle) => {
          if (!ids.includes(object.do_objectID)) return;

          const group = delimitedPath.dirname(object.name);

          object.name = delimitedPath.join([group, name]);
        });
      });
    }
    case 'setThemeStyle': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      const [, id] = action;

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          const style = draft.sketch.document.layerStyles?.objects.find(
            (s) => s.do_objectID === id,
          );

          if (style) {
            layer.sharedStyleID = id;
            layer.style = produce(style.value, (style) => {
              style.do_objectID = uuid();
              return style;
            });
          } else {
            delete layer.sharedStyleID;
          }
        });
      });
    }
    case 'updateThemeStyle': {
      const [, id, style] = action;
      const layerIndexPathsWithSharedStyle = findPageLayerIndexPaths(
        state,
        (layer) =>
          layer.sharedStyleID !== undefined && id === layer.sharedStyleID,
      );
      return produce(state, (draft) => {
        if (!style) return;

        const sharedStyles = draft.sketch.document.layerStyles.objects;

        sharedStyles.forEach((sharedStyle: Sketch.SharedStyle) => {
          if (id !== sharedStyle.do_objectID) return;

          sharedStyle.value = produce(style, (style) => {
            style.do_objectID = uuid();
            return style;
          });

          layerIndexPathsWithSharedStyle.forEach((layerPath) =>
            accessPageLayers(
              draft,
              layerPath.pageIndex,
              layerPath.indexPaths,
            ).forEach((layer) => {
              layer.style = produce(style, (style) => {
                style.do_objectID = uuid();
                return style;
              });
            }),
          );
        });
      });
    }
    case 'removeSwatch': {
      const ids = state.selectedSwatchIds;

      return produce(state, (draft) => {
        const sharedSwatches = draft.sketch.document.sharedSwatches;

        if (!sharedSwatches) return;

        const filterSwatches = sharedSwatches.objects.filter(
          (object: Sketch.Swatch) => !ids.includes(object.do_objectID),
        );
        sharedSwatches.objects = filterSwatches;

        draft.sketch.document.sharedSwatches = sharedSwatches;
      });
    }
    case 'removeTextStyle': {
      const ids = state.selectedTextStyleIds;

      return produce(state, (draft) => {
        const layerStyles = draft.sketch.document.layerTextStyles;

        if (!layerStyles) return;

        const filterLayer = layerStyles.objects.filter(
          (object: Sketch.SharedStyle) => !ids.includes(object.do_objectID),
        );

        layerStyles.objects = filterLayer;
        draft.sketch.document.layerTextStyles = layerStyles;
      });
    }
    case 'removeThemeStyle': {
      const ids = state.selectedLayerStyleIds;

      const layerIndexPathsWithSharedStyle = findPageLayerIndexPaths(
        state,
        (layer) =>
          layer.sharedStyleID !== undefined &&
          ids.includes(layer.sharedStyleID),
      );

      return produce(state, (draft) => {
        const layerStyles = draft.sketch.document.layerStyles;

        if (!layerStyles) return;

        const filterLayer = layerStyles.objects.filter(
          (object: Sketch.SharedStyle) => !ids.includes(object.do_objectID),
        );

        layerStyles.objects = filterLayer;
        draft.sketch.document.layerStyles = layerStyles;

        layerIndexPathsWithSharedStyle.forEach((layerPath) =>
          accessPageLayers(
            draft,
            layerPath.pageIndex,
            layerPath.indexPaths,
          ).forEach((layer) => {
            delete layer.sharedStyleID;
          }),
        );
      });
    }
    case 'setSelectedSwatchGroup':
    case 'setSelectedThemeStyleGroup':
    case 'setSelectedTextStyleGroup': {
      const [, id] = action;
      return produce(state, (draft) => {
        if (action[0] === 'setSelectedSwatchGroup')
          draft.selectedSwatchGroup = id;
        else draft.selectedThemeStyleGroup = id;
      });
    }
    case 'groupSwatches':
    case 'groupTextStyles':
    case 'groupThemeStyles': {
      const [, id, value] = action;

      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        const array =
          action[0] === 'groupSwatches'
            ? draft.sketch.document.sharedSwatches?.objects ?? []
            : action[0] === 'groupTextStyles'
            ? draft.sketch.document.layerTextStyles?.objects ?? []
            : draft.sketch.document.layerStyles?.objects ?? [];

        array.forEach((object: Sketch.Swatch | Sketch.SharedStyle) => {
          if (!ids.includes(object.do_objectID)) return;
          const prevGroup = value ? delimitedPath.dirname(object.name) : '';
          const name = delimitedPath.basename(object.name);
          const newName = delimitedPath.join([prevGroup, value, name]);

          object.name = newName;
        });

        if (action[0] === 'groupSwatches') draft.selectedSwatchGroup = '';
        else if (action[0] === 'groupThemeStyles')
          draft.selectedThemeStyleGroup = '';
        else if (action[0] === 'groupTextStyles')
          draft.selectedTextStyleGroup = '';
      });
    }
    case 'setTextColor':
    case 'setTextFontName':
    case 'setTextFontSize':
    case 'setTextLineSpacing':
    case 'setTextLetterSpacing':
    case 'setTextParagraphSpacing':
    case 'setTextHorizontalAlignment':
    case 'setTextVerticalAlignment': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          if (layer._class !== 'text' || layer.style?.textStyle === undefined)
            return;

          switch (action[0]) {
            case 'setTextVerticalAlignment': {
              layer.style.textStyle.verticalAlignment = action[1];

              break;
            }
          }

          layer.style.textStyle.encodedAttributes = stringAttributeReducer(
            layer.style.textStyle.encodedAttributes,
            action,
          );

          layer.attributedString.attributes.forEach((attribute, index) => {
            layer.attributedString.attributes[
              index
            ].attributes = stringAttributeReducer(attribute.attributes, action);
          });
        });
      });
    }
    case 'setTextAlignment': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          if (layer._class !== 'text' || layer.style?.textStyle === undefined)
            return;

          layer.textBehaviour = action[1];
        });
      });
    }
    case 'setTextDecoration':
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          if (layer._class !== 'text' || layer.style?.textStyle === undefined)
            return;

          const attributes = layer.style?.textStyle?.encodedAttributes;

          if (!attributes) return;

          attributes.underlineStyle = action[1] === 'underline' ? 1 : 0;
          attributes.strikethroughStyle = action[1] === 'strikethrough' ? 1 : 0;
        });
      });
    case 'setTextTransform': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          if (layer._class !== 'text' || layer.style?.textStyle === undefined)
            return;

          const encoded = layer.style?.textStyle?.encodedAttributes;

          if (!encoded) return;

          encoded.MSAttributedStringTextTransformAttribute = action[1];
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
    selectedTextStyleIds: [],
    selectedSwatchGroup: '',
    selectedThemeStyleGroup: '',
    selectedTextStyleGroup: '',
    sketch,
  };
}
