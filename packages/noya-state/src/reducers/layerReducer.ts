import { RelativeDropPosition } from '@noya-app/noya-designsystem';
import { Sketch } from '@noya-app/noya-file-format';
import {
  AffineTransform,
  Point,
  createBounds,
  rectContainsRect,
  transformRect,
  unionRects,
} from '@noya-app/noya-geometry';
import { getIncrementedName, groupBy, uuid } from '@noya-app/noya-utils';
import produce from 'immer';
import { SketchModel } from 'noya-sketch-model';
import {
  ApplicationReducerContext,
  Primitives,
  findIndexPath,
} from 'noya-state';
import { IndexPath } from 'tree-visit';
import * as Layers from '../layers';
import { PageLayer } from '../layers';
import {
  LayerIndexPaths,
  addSiblingLayer,
  addToParentLayer,
  applyOverrides,
  deleteLayers,
  findPageLayerIndexPaths,
  getBoundingRect,
  getCurrentPage,
  getCurrentPageIndex,
  getIndexPathsForGroup,
  getIndexPathsOfArtboardLayers,
  getLayerIndexPathsExcludingDescendants,
  getLayerTransformAtIndexPath,
  getLayersInRect,
  getParentLayer,
  getRightMostLayerBounds,
  getSelectedLayerIndexPathsExcludingDescendants,
  getSelectedSymbols,
  getSymbolMaster,
  getSymbols,
  getSymbolsInstancesIndexPaths,
  getSymbolsPageIndex,
  insertLayerAtIndexPath,
  moveLayer,
  removeLayer,
} from '../selectors';
import { createPage, getSymbolsPage } from '../selectors/pageSelectors';
import { SelectionType, updateSelection } from '../utils/selection';
import type { ApplicationState } from './applicationReducer';

export type AddLayerOptions = {
  point?: Point;
  useOriginalDimensions?: boolean;
};

export type LayerAction =
  | [
      type: 'moveLayer',
      layerId: string | string[],
      relativeLayer: string,
      position: RelativeDropPosition,
    ]
  | [type: 'bringToFront', layerId: string | string[]]
  | [type: 'sendToBack', layerId: string | string[]]
  | [type: 'deleteLayer', layerId: string | string[]]
  | [type: 'groupLayers', layerId: string | string[]]
  | [type: 'ungroupLayers', layerId: string | string[]]
  | [type: 'convertInstanceToSymbol', name: string]
  | [type: 'createSymbol', layerId: string | string[], name: string]
  | [type: 'detachSymbol', layerId: string | string[]]
  | [type: 'deleteSymbol', ids: string[]]
  | [
      type: 'duplicateLayer',
      ids: string[],
      options?: {
        incrementName?: boolean;
      },
    ]
  | [
      type: 'addLayer',
      data: Sketch.AnyLayer | Sketch.AnyLayer[],
      options?: AddLayerOptions,
    ]
  | [type: 'setLayers', layers: Sketch.SymbolInstance[]]
  | [
      type: 'selectLayer',
      layerId: string | string[] | undefined,
      selectionType?: SelectionType,
    ]
  | [type: 'selectAllLayers'];

const createGroup = <T extends Sketch.Group | Sketch.SymbolMaster>(
  model: T,
  page: Sketch.Page,
  ids: string[],
  name: string,
  indexPaths: IndexPath[],
): T | undefined => {
  const boundingRect = getBoundingRect(page, ids, {
    groups: 'childrenOnly',
    includeHiddenLayers: true,
  });

  if (!boundingRect) {
    console.info('[groupLayer] Selected layers not found');
    return undefined;
  }

  const newParentTransform = getLayerTransformAtIndexPath(page, indexPaths[0]);

  const groupFrame = transformRect(boundingRect, newParentTransform.invert());

  const newGroupTransform = AffineTransform.multiply(
    newParentTransform,
    AffineTransform.translate(groupFrame.x, groupFrame.y),
  );

  return produce(model, (draft) => {
    draft.do_objectID = uuid();
    draft.name = name;
    draft.frame = SketchModel.rect(groupFrame);
    draft.style = SketchModel.style();

    draft.layers = [...indexPaths].map((indexPath) => {
      const layer = Layers.access(page, indexPath) as Layers.ChildLayer;

      const originalParentTransform = getLayerTransformAtIndexPath(
        page,
        indexPath,
      );

      // First we undo original parent's transform, then we apply the new group's transform
      const transform = AffineTransform.multiply(
        originalParentTransform,
        newGroupTransform.invert(),
      );

      return produce(layer, (draftLayer) => {
        draftLayer.frame = {
          ...draftLayer.frame,
          ...transformRect(draftLayer.frame, transform),
        };
      });
    });
  });
};

const symbolToGroup = (
  page: Sketch.Page,
  state: ApplicationState,
  parent: Layers.ParentLayer,
  indexPath: IndexPath,
) => {
  const index = indexPath[indexPath.length - 1];
  const element = parent.layers[index] as Sketch.SymbolInstance;

  const symbol = getSymbols(state).filter(
    (s) => s.symbolID === element.symbolID,
  )[0];

  const group = SketchModel.group({
    name: element.name,
    frame: element.frame,
    layers: symbol.layers.map((l) =>
      produce(l, (l) => {
        l.do_objectID = uuid();
      }),
    ),
  });

  deleteLayers([indexPath], page);
  addSiblingLayer(page, indexPath, group);
};

export const detachSymbolIntances = (
  pages: Sketch.Page[],
  state: ApplicationState,
  symbolsInstancesIndexPaths: LayerIndexPaths[],
) => {
  symbolsInstancesIndexPaths.forEach((element) => {
    const { indexPaths, pageIndex } = element;
    indexPaths.forEach((indexPath) => {
      const page = pages[pageIndex];

      const parent = getParentLayer(page, indexPath);
      symbolToGroup(page, state, parent, indexPath);
    });
  });
};

export function layerReducer(
  state: ApplicationState,
  action: LayerAction,
  context: ApplicationReducerContext,
): ApplicationState {
  switch (action[0]) {
    case 'moveLayer': {
      const [, id, destinationId, rawPosition] = action;

      // Since layers are stored in reverse order, to place a layer "above",
      // we actually place it "below" in terms of index, etc.
      return moveLayer(state, id, destinationId, rawPosition);
    }
    case 'bringToFront':
    case 'sendToBack': {
      const [type, id] = action;

      const ids = typeof id === 'string' ? [id] : id;
      const page = getCurrentPage(state);
      const indexPaths = Layers.findAllIndexPaths(page, (layer) =>
        ids.includes(layer.do_objectID),
      );
      const groupedByParent = groupBy(indexPaths, (indexPath) =>
        indexPath.slice(0, -1).join(','),
      );

      return (
        Object.entries(groupedByParent)
          // Convert index paths back to layer ids
          .map(([parentKey, childrenIndexPaths]) => {
            const parentIndexPath = parentKey.split(',').map(Number);
            const parentId = Layers.access(page, parentIndexPath).do_objectID;
            const childrenIds = childrenIndexPaths
              .map((indexPath) => Layers.access(page, indexPath))
              .map((layer) => layer.do_objectID);
            return [parentId, childrenIds] as const;
          })
          .reduce((result, [parentId, childrenIds]) => {
            return moveLayer(
              result,
              childrenIds,
              parentId,
              type === 'bringToFront' ? 'inside' : 'inside-end',
            );
          }, state)
      );
    }
    case 'deleteLayer':
    case 'deleteSymbol': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const indexPaths = findPageLayerIndexPaths(state, (layer) =>
        ids.includes(layer.do_objectID),
      );

      const symbolsInstancesIndexPaths = getSelectedSymbols(state).flatMap(
        (symbol) => getSymbolsInstancesIndexPaths(state, symbol.symbolID),
      );

      return produce(state, (draft) => {
        detachSymbolIntances(
          draft.sketch.pages,
          state,
          symbolsInstancesIndexPaths,
        );
        indexPaths.forEach((i) =>
          deleteLayers(i.indexPaths, draft.sketch.pages[i.pageIndex]),
        );
      });
    }
    case 'groupLayers': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const indexPaths = getLayerIndexPathsExcludingDescendants(state, ids);

      const targetIndexPath = indexPaths[0];
      const parentLayer = Layers.access(
        page,
        targetIndexPath.slice(0, -1),
      ) as Layers.ParentLayer;

      const siblingNames = parentLayer.layers.map((layer) => layer.name);

      const group = SketchModel.group({
        name: siblingNames.includes('Group')
          ? getIncrementedName('Group', siblingNames)
          : 'Group',
      });

      // Insert the group layer
      state = insertLayerAtIndexPath(state, group, targetIndexPath, 'above');

      // Move all selected layers into the new group
      return moveLayer(state, ids, group.do_objectID, 'inside');
    }
    case 'ungroupLayers': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const indexPaths = getLayerIndexPathsExcludingDescendants(state, ids);

      return indexPaths.reduce((state, indexPath) => {
        const groupLayer = Layers.access(page, indexPath);

        if (!Layers.isGroup(groupLayer)) return state;

        const childrenIds = groupLayer.layers.map((layer) => layer.do_objectID);

        state = moveLayer(state, childrenIds, groupLayer.do_objectID, 'above');

        state = removeLayer(state, groupLayer.do_objectID);

        return produce(state, (draft) => {
          updateSelection(
            draft.selectedLayerIds,
            groupLayer.do_objectID,
            'difference',
          );
          updateSelection(draft.selectedLayerIds, childrenIds, 'intersection');
        });
      }, state);
    }
    case 'detachSymbol': {
      const [, id] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPaths = getIndexPathsForGroup(state, ids)[0];

      return produce(state, (draft) => {
        const parent = getParentLayer(page, indexPaths);
        const draftPage = draft.sketch.pages[pageIndex];

        symbolToGroup(draftPage, state, parent, indexPaths);

        if (!Layers.isPageLayer(parent)) {
          draft.selectedLayerIds = [parent.do_objectID];
        }
      });
    }
    case 'selectLayer': {
      const [, id, selectionType = 'replace'] = action;

      return produce(state, (draft) => {
        updateSelection(draft.selectedLayerIds, id, selectionType);
      });
    }
    case 'selectAllLayers': {
      const page = getCurrentPage(state);
      const ids = page.layers.map((layer) => layer.do_objectID);

      return produce(state, (draft) => {
        updateSelection(draft.selectedLayerIds, ids, 'replace');
      });
    }
    case 'convertInstanceToSymbol': {
      const [, name] = action;

      state = ensureSymbolsPage(state);

      const currentPage = getCurrentPage(state);

      const selectedLayer = Layers.find(
        currentPage,
        (layer) => layer.do_objectID === state.selectedLayerIds[0],
      );

      if (!selectedLayer || !Layers.isSymbolInstance(selectedLayer)) {
        return state;
      }

      const pageIndex = getCurrentPageIndex(state);
      const indexPath = Layers.findIndexPath(
        currentPage,
        (layer) => layer.do_objectID === selectedLayer.do_objectID,
      )!;

      const oldMaster = applyOverrides({
        symbolMaster: getSymbolMaster(state, selectedLayer.symbolID),
        overrideValues: selectedLayer.overrideValues,
        layerStyles: state.sketch.document.layerStyles,
        layerTextStyles: state.sketch.document.layerTextStyles,
      });

      state = produce(state, (draft) => {
        const newMaster = SketchModel.symbolMaster({
          ...oldMaster,
          blockDefinition: {
            ...oldMaster.blockDefinition,
            placeholderParameters: selectedLayer.blockParameters,
            placeholderText: selectedLayer.blockText,
          },
          symbolID: uuid(),
          name,
        });

        const symbolsPage = getSymbolsPage(draft)!;

        symbolsPage.layers.push(newMaster);

        deleteLayers([indexPath], draft.sketch.pages[pageIndex]);

        const symbolInstance = SketchModel.symbolInstance({
          name,
          symbolID: newMaster.symbolID,
          frame: selectedLayer.frame,
        });

        addSiblingLayer(
          draft.sketch.pages[pageIndex],
          indexPath,
          symbolInstance,
        );

        draft.selectedLayerIds = [symbolInstance.do_objectID];
      });

      return state;
    }
    case 'createSymbol': {
      const [, id, name] = action;
      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPathsArtboards = getIndexPathsOfArtboardLayers(state, ids);

      if (indexPathsArtboards.length > 0) {
        return produce(state, (draft) => {
          const pages = draft.sketch.pages;

          deleteLayers(indexPathsArtboards, pages[pageIndex]);
          draft.selectedLayerIds = [];
          indexPathsArtboards.forEach((indexPath: IndexPath) => {
            const artboard = Layers.access(page, indexPath) as Sketch.Artboard;

            const symbolMaster = SketchModel.symbolMaster({
              ...artboard,
            });

            addSiblingLayer(pages[pageIndex], indexPath, symbolMaster);
            draft.selectedLayerIds = [
              ...draft.selectedLayerIds,
              symbolMaster.do_objectID,
            ];
          });
        });
      }

      state = ensureSymbolsPage(state);

      const symbolsPageIndex = getSymbolsPageIndex(state);
      const indexPaths = getIndexPathsForGroup(state, ids);
      const symbolMaster = createGroup(
        SketchModel.symbolMaster(),
        page,
        ids,
        name,
        indexPaths,
      );

      if (!symbolMaster) return state;

      const originalFrame = { ...symbolMaster.frame };
      const symbolsPage = state.sketch.pages[symbolsPageIndex];

      const rect = symbolsPage
        ? getRightMostLayerBounds(symbolsPage)
        : { maxX: 0, minY: 25 };

      symbolMaster.frame.x = rect.maxX + 100;
      symbolMaster.frame.y = rect.minY;

      return produce(state, (draft) => {
        const pages = draft.sketch.pages;

        deleteLayers(indexPaths, pages[pageIndex]);

        const symbolsPage = pages[symbolsPageIndex];

        const symbolInstance = SketchModel.symbolInstance({
          name: symbolMaster.name,
          symbolID: symbolMaster.symbolID,
          frame: originalFrame,
        });

        symbolsPage.layers = [...symbolsPage.layers, symbolMaster];
        addSiblingLayer(pages[pageIndex], indexPaths[0], symbolInstance);

        draft.selectedLayerIds = [symbolInstance.do_objectID];
      });
    }
    case 'duplicateLayer': {
      const [, id, options] = action;

      const ids = typeof id === 'string' ? [id] : id;

      const page = getCurrentPage(state);
      const pageIndex = getCurrentPageIndex(state);
      const indexPaths = getLayerIndexPathsExcludingDescendants(state, ids);

      const parentIds = indexPaths.map(
        (indexPath) => getParentLayer(page, indexPath).do_objectID,
      );

      // Layers should be duplicated independently within each parent and placed
      // above the "top" selected layer in that parent.
      const groupedByParent = groupBy(
        indexPaths,
        (indexPath) => getParentLayer(page, indexPath).do_objectID,
      );

      // Insert in reverse order to preserve indexPaths
      const parentIndexPaths = Layers.findAllIndexPaths(page, (layer) =>
        parentIds.includes(layer.do_objectID),
      ).reverse();

      return produce(state, (draft) => {
        const draftPage = draft.sketch.pages[pageIndex];

        draft.selectedLayerIds = [];

        parentIndexPaths.forEach((indexPath) => {
          const originalParent = Layers.access(
            page,
            indexPath,
          ) as Layers.ParentLayer;

          const draftParent = Layers.access(
            draftPage,
            indexPath,
          ) as Layers.ParentLayer;

          const childIndexes = groupedByParent[originalParent.do_objectID].map(
            (indexPath) => indexPath[indexPath.length - 1],
          );

          // Get the index of the "top" layer
          const lastIndex = Math.max(...childIndexes);

          const copiedLayers = childIndexes
            .map((index) => originalParent.layers[index])
            .map((l) => copyLayer(l, options));

          // Insert "above" the original in the layer list
          draftParent.layers.splice(lastIndex + 1, 0, ...copiedLayers);

          draft.selectedLayerIds.push(
            ...copiedLayers.map((layer) => layer.do_objectID),
          );
        });
      });
    }
    case 'addLayer': {
      const [, layer, options = {}] = action;
      const { useOriginalDimensions = false, point } = options;

      const layers = Array.isArray(layer) ? layer : [layer];
      const currentPageIndex = getCurrentPageIndex(state);
      const selectedLayerIndexPath =
        getSelectedLayerIndexPathsExcludingDescendants(state)[0];

      const { canvasSize, canvasInsets } = context;
      const viewportCenter = {
        x: canvasSize.width / 2,
        y: canvasSize.height / 2,
      };
      const visibleRect = {
        x: -canvasInsets.left,
        y: -canvasInsets.top,
        width: canvasSize.width + canvasInsets.left + canvasInsets.right,
        height: canvasSize.height + canvasInsets.top + canvasInsets.bottom,
      };
      const isolatedLayerIndexPath = state.isolatedLayerId
        ? Layers.findIndexPath(
            getCurrentPage(state),
            (l) => l.do_objectID === state.isolatedLayerId,
          )
        : undefined;

      const newLayersBoundingRect = unionRects(
        ...layers.map((layer) => layer.frame),
      );

      return produce(state, (draft) => {
        const draftPage = draft.sketch.pages[currentPageIndex];
        draft.selectedLayerIds = [];

        const meta = draft.sketch.user[draftPage.do_objectID] ?? {
          zoomValue: 1,
          scrollOrigin: '{0,0}',
        };

        const parsed = Primitives.parsePoint(meta.scrollOrigin);

        const allVisibleLayersIds = getLayersInRect(
          state,
          draftPage,
          canvasInsets,
          visibleRect,
          {
            includeHiddenLayers: true,
            groups: 'groupAndChildren',
            artboards: 'artboardAndChildren',
          },
        ).map((layer) => layer.do_objectID);

        layers.forEach((layer) => {
          if (Layers.isPageLayer(layer)) return;

          const bounds = createBounds({
            width: layer.frame.width,
            height: layer.frame.height,
          });

          let newLayer = produce(copyLayer(layer), (l) => {
            l.name = layer.name;
          });

          // If the original is selected, add the copy as a sibling
          if (allVisibleLayersIds.includes(layer.do_objectID)) {
            const indexPath =
              findIndexPath(
                draftPage,
                (l) => l.do_objectID === layer.do_objectID,
              ) ?? [];

            addSiblingLayer(draftPage, indexPath, newLayer);
          } else {
            const selectedLayer =
              isolatedLayerIndexPath && isolatedLayerIndexPath
                ? Layers.access(draftPage, isolatedLayerIndexPath)
                : selectedLayerIndexPath && selectedLayerIndexPath.length > 0
                ? Layers.access(draftPage, selectedLayerIndexPath)
                : draftPage;

            // If the selected layer is a (non-page) parent layer
            if (
              Layers.isParentLayer(selectedLayer) &&
              !Layers.isPageLayer(selectedLayer)
            ) {
              const parentBounds = createBounds({
                width: selectedLayer.frame.width,
                height: selectedLayer.frame.height,
              });

              newLayer = produce(newLayer, (draftLayer) => {
                // TODO: We may not need this flag. But need to test this behavior on noya.design.
                if (useOriginalDimensions) {
                  const newLayersFitWithinParent = rectContainsRect(
                    selectedLayer.frame,
                    newLayersBoundingRect,
                  );

                  if (newLayersFitWithinParent) return;

                  // Center all layers within parent
                  draftLayer.frame.x +=
                    parentBounds.midX -
                    createBounds(newLayersBoundingRect).midX;
                  draftLayer.frame.y +=
                    parentBounds.midY -
                    createBounds(newLayersBoundingRect).midY;
                  return;
                }

                // Center layers individually at target point or within parent
                const targetPoint = point
                  ? point
                  : { x: parentBounds.midX, y: parentBounds.midY };

                draftLayer.frame.x = targetPoint.x - bounds.midX;
                draftLayer.frame.y = targetPoint.y - bounds.midY;
              });

              addToParentLayer(selectedLayer.layers, newLayer);
            } else {
              // The selected layer is a child layer or the page.

              // Center the copy within the viewport.
              newLayer = produce(newLayer, (draftLayer) => {
                draftLayer.frame.x = viewportCenter.x - parsed.x - bounds.midX;
                draftLayer.frame.y = viewportCenter.y - parsed.y - bounds.midY;
              });

              // If the selected layer is a child layer
              if (!Layers.isPageLayer(selectedLayer)) {
                const selectedLayerParent = getParentLayer(
                  draftPage,
                  selectedLayerIndexPath,
                );

                // And its parent is not the page
                if (!Layers.isPageLayer(selectedLayerParent)) {
                  const parentFrame = createBounds({
                    width: selectedLayerParent.frame.width,
                    height: selectedLayerParent.frame.height,
                  });

                  // Center the layer within the new parent
                  newLayer = produce(newLayer, (draftLayer) => {
                    draftLayer.frame.x = parentFrame.midX - bounds.midX;
                    draftLayer.frame.y = parentFrame.midY - bounds.midY;
                  });

                  addSiblingLayer(draftPage, selectedLayerIndexPath, newLayer);
                } else {
                  addSiblingLayer(draftPage, selectedLayerIndexPath, newLayer);
                }
              } else {
                draftPage.layers.push(newLayer);
              }
            }
          }

          draft.selectedLayerIds.push(newLayer.do_objectID);
        });
      });
    }
    default:
      return state;
  }
}

function copyLayer(
  targetLayer: PageLayer,
  options?: { incrementName?: boolean },
) {
  return produce(targetLayer, (draft) => {
    if (options?.incrementName !== false) {
      draft.name = draft.name + ' Copy';
    }

    Layers.visit(draft, (layer) => {
      layer.do_objectID = uuid();

      if (layer.style) {
        layer.style.do_objectID = uuid();
      }

      if (Layers.isSymbolMasterOrArtboard(layer)) {
        layer.frame.x += layer.frame.width + 100;
      }

      // When we duplicate a symbolMaster, we also duplicate its symbolID.
      // In other words, a duplicated symbolMaster will have no attached instances.
      if (Layers.isSymbolMaster(layer)) {
        layer.symbolID = uuid();
      }
    });
  });
}

function ensureSymbolsPage(state: ApplicationState) {
  if (getSymbolsPage(state)) return state;

  return produce(state, (draft) => {
    createPage(draft.sketch.pages, draft.sketch.user, uuid(), 'Symbols');
  });
}
