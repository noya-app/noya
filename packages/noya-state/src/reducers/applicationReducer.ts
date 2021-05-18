import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { uuid } from 'noya-renderer';
import { SketchFile } from 'noya-sketch-file';
import { IndexPath } from 'tree-visit';
import * as Layers from '../layers';
import {
  findPageLayerIndexPaths,
  getCurrentComponentsTab,
  getCurrentPageIndex,
  getCurrentTab,
  getSelectedLayerIndexPaths,
} from '../selectors/selectors';
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
import { LayerAction, layerReducer } from './layerReducer';
import { PageAction, pageReducer } from './pageReducer';
import { SetNumberMode, StyleAction, styleReducer } from './styleReducer';
import { TextStyleAction, textStyleReducer } from './textStyleReducer';
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
  selectedSymbolsIds: string[];
  selectedSwatchGroup: string;
  selectedTextStyleGroup: string;
  selectedThemeStyleGroup: string;
  selectedSymbolGroup: string;
  sketch: SketchFile;
};

export type Action =
  | [type: 'setTab', value: WorkspaceTab]
  | PageAction
  | CanvasAction
  | LayerPropertyAction
  | LayerAction
  | AlignmentAction
  | StyleAction
  | TextStyleAction
  | ThemeAction;

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
    case 'deleteLayer':
    case 'selectLayer':
    case 'groupLayer':
    case 'ungroupLayer':
    case 'addSymbol':
      return layerReducer(state, action);
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
      if (getCurrentTab(state) === 'canvas') {
        const pageIndex = getCurrentPageIndex(state);
        const layerIndexPaths = getSelectedLayerIndexPaths(state);

        return produce(state, (draft) => {
          accessPageLayers(draft, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              if (!layer.style) return;

              layer.style = styleReducer(layer.style, action);
            },
          );
        });
      } else {
        const ids = state.selectedLayerStyleIds;

        const layerIndexPathsWithSharedStyle = findPageLayerIndexPaths(
          state,
          (layer) =>
            layer.sharedStyleID !== undefined &&
            ids.includes(layer.sharedStyleID),
        );

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
    case 'setTextVerticalAlignment':
    case 'setTextAlignment':
    case 'setTextDecoration':
    case 'setTextTransform':
      return textStyleReducer(state, action);
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
    currentTab: 'theme',
    currentThemeTab: 'symbols',
    interactionState: createInitialInteractionState(),
    selectedPage: sketch.pages[0].do_objectID,
    selectedObjects: [],
    selectedSwatchIds: [],
    selectedLayerStyleIds: [],
    selectedTextStyleIds: [],
    selectedSymbolsIds: [],
    selectedSwatchGroup: '',
    selectedThemeStyleGroup: '',
    selectedTextStyleGroup: '',
    selectedSymbolGroup: '',
    sketch,
  };
}
