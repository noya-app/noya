import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { SimpleTextDecoration, uuid } from 'noya-renderer';
import { SketchFile } from 'noya-sketch-file';
import { IndexPath } from 'tree-visit';
import * as Layers from '../layers';
import {
  findPageLayerIndexPaths,
  getCurrentComponentsTab,
  getCurrentPage,
  getCurrentPageIndex,
  getCurrentTab,
  getSelectedLayerIndexPaths,
} from '../selectors/selectors';
import { SelectionType, updateSelection } from '../utils/selection';
import { AlignmentAction, alignmentReducer } from './alignmentReducer';
import { CanvasAction, canvasReducer } from './canvasReducer';
import {
  createInitialInteractionState,
  interactionReducer,
  InteractionState,
} from './interactionReducer';
import {
  LayerPropertyAction,
  layerPropertyReducer,
} from './layerPropertyReducer';
import { PageAction, pageReducer } from './pageReducer';
import {
  StringAttributeAction,
  stringAttributeReducer,
} from './stringAttributeReducer';
import { SetNumberMode, StyleAction, styleReducer } from './styleReducer';
import { ThemeAction, themeReducer } from './themeReducer';

export type { SetNumberMode };

export type WorkspaceTab = 'canvas' | 'theme';

export type ThemeTab = 'swatches' | 'textStyles' | 'layerStyles' | 'symbols';

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

export type Action =
  | [type: 'setTab', value: WorkspaceTab]
  | PageAction
  | CanvasAction
  | [type: 'deleteLayer', layerId: string | string[]]
  | [
      type: 'selectLayer',
      layerId: string | string[] | undefined,
      selectionType?: SelectionType,
    ]
  | StyleAction
  | StringAttributeAction
  | AlignmentAction
  | LayerPropertyAction
  | ThemeAction
  | [type: 'setTextAlignment', value: number]
  | [type: 'setTextDecoration', value: SimpleTextDecoration]
  | [type: 'setTextTransform', value: number];

export function applicationReducer(
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
    case 'selectPage':
    case 'addPage':
    case 'renamePage':
    case 'duplicatePage':
    case 'deletePage':
    case 'movePage': {
      return pageReducer(state, action);
    }
    case 'insertArtboard':
    case 'addDrawnLayer':
    case 'interaction':
      return canvasReducer(state, action);
    case 'setLayerVisible':
    case 'setExpandedInLayerList':
    case 'setFixedRadius':
    case 'setLayerRotation':
      return layerPropertyReducer(state, action);
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

      return produce(state, (draft) => {
        updateSelection(draft.selectedObjects, id, selectionType);
      });
    }
    case 'distributeLayers':
    case 'alignLayers': {
      return alignmentReducer(state, action);
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

      if (getCurrentTab(state) === 'canvas') {
        return produce(state, (draft) => {
          accessPageLayers(draft, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              if (
                layer._class !== 'text' ||
                layer.style?.textStyle === undefined
              )
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
                ].attributes = stringAttributeReducer(
                  attribute.attributes,
                  action,
                );
              });
            },
          );
        });
      } else {
        const ids = state.selectedTextStyleIds;

        return produce(state, (draft) => {
          const layerTextStyles =
            draft.sketch.document.layerTextStyles?.objects ?? [];

          layerTextStyles.forEach((sharedTextStyle: Sketch.SharedStyle) => {
            if (
              !ids.includes(sharedTextStyle.do_objectID) ||
              sharedTextStyle.value.textStyle === undefined
            )
              return;

            sharedTextStyle.value.textStyle.encodedAttributes = stringAttributeReducer(
              sharedTextStyle.value.textStyle.encodedAttributes,
              action,
            );
          });
        });
      }
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

      if (getCurrentTab(state) === 'canvas') {
        return produce(state, (draft) => {
          accessPageLayers(draft, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              if (
                layer._class !== 'text' ||
                layer.style?.textStyle === undefined
              )
                return;

              const attributes = layer.style?.textStyle?.encodedAttributes;

              if (!attributes) return;

              attributes.underlineStyle = action[1] === 'underline' ? 1 : 0;
              attributes.strikethroughStyle =
                action[1] === 'strikethrough' ? 1 : 0;
            },
          );
        });
      } else {
        return produce(state, (draft) => {
          const ids = state.selectedTextStyleIds;

          const layerTextStyles =
            draft.sketch.document.layerTextStyles?.objects ?? [];

          layerTextStyles.forEach((sharedTextStyle: Sketch.SharedStyle) => {
            if (
              !ids.includes(sharedTextStyle.do_objectID) ||
              sharedTextStyle.value.textStyle === undefined
            )
              return;
            const attributes =
              sharedTextStyle.value.textStyle?.encodedAttributes;

            if (!attributes) return;

            attributes.underlineStyle = action[1] === 'underline' ? 1 : 0;
            attributes.strikethroughStyle =
              action[1] === 'strikethrough' ? 1 : 0;
          });
        });
      }
    case 'setTextTransform': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      if (getCurrentTab(state) === 'canvas') {
        return produce(state, (draft) => {
          accessPageLayers(draft, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              if (
                layer._class !== 'text' ||
                layer.style?.textStyle === undefined
              )
                return;

              const encoded = layer.style?.textStyle?.encodedAttributes;

              if (!encoded) return;

              encoded.MSAttributedStringTextTransformAttribute = action[1];
            },
          );
        });
      } else {
        return produce(state, (draft) => {
          const ids = state.selectedTextStyleIds;

          const layerTextStyles =
            draft.sketch.document.layerTextStyles?.objects ?? [];

          layerTextStyles.forEach((sharedTextStyle: Sketch.SharedStyle) => {
            if (
              !ids.includes(sharedTextStyle.do_objectID) ||
              sharedTextStyle.value.textStyle === undefined
            )
              return;
            const attributes =
              sharedTextStyle.value.textStyle?.encodedAttributes;

            if (!attributes) return;

            attributes.MSAttributedStringTextTransformAttribute = action[1];
          });
        });
      }
    }
    default:
      return themeReducer(state, action);
  }
}

/**
 * Get an array of all layers using as few lookups as possible on the state tree.
 *
 * Immer will duplicate any objects we access within a produce method, so we
 * don't want to walk every layer, since that would duplicate all of them.
 */
export function accessPageLayers(
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
