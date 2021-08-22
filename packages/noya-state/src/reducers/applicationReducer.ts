import Sketch from 'noya-file-format';
import { CanvasKit } from 'canvaskit';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { Insets, Size } from 'noya-geometry';
import { KeyModifiers } from 'noya-keymap';
import { IFontManager } from 'noya-renderer';
import { SketchFile } from 'noya-sketch-file';
import { Selectors } from 'noya-state';
import { uuid } from 'noya-utils';
import { IndexPath } from 'tree-visit';
import * as Layers from '../layers';
import { getSelectedGradient } from '../selectors/gradientSelectors';
import {
  findPageLayerIndexPaths,
  fixGradientPositions,
  getCurrentComponentsTab,
  getCurrentPageIndex,
  getCurrentTab,
  getLayerParagraph,
  getSelectedLayerIndexPaths,
  setNewPatternFill,
  setNewShaderFill,
} from '../selectors/selectors';
import { AlignmentAction, alignmentReducer } from './alignmentReducer';
import { CanvasAction, canvasReducer } from './canvasReducer';
import { ExportAction, exportReducer } from './exportReducer';
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
import { markLayersAsEdited, PointAction, pointReducer } from './pointReducer';
import { SetNumberMode, StyleAction, styleReducer } from './styleReducer';
import { SymbolsAction, symbolsReducer } from './symbolsReducer';
import { TextEditorAction, textEditorReducer } from './textEditorReducer';
import { TextStyleAction, textStyleReducer } from './textStyleReducer';
import { ThemeAction, themeReducer } from './themeReducer';

export type { SetNumberMode };

export type WorkspaceTab = 'canvas' | 'theme' | 'pages';

export type ThemeTab = 'swatches' | 'textStyles' | 'layerStyles' | 'symbols';
type ThemeSelection = { ids: string[]; groupName: string };

export type controlPointType = 'curveFrom' | 'curveTo';

export type SelectedControlPoint = {
  layerId: string;
  pointIndex: number;
  controlPointType: controlPointType;
};

export type SelectedGradient = {
  layerId: string;
  fillIndex: number;
  stopIndex: number;
  styleType: 'fills' | 'borders';
};

export type SelectedPointLists = Record<string, number[]>;

export type ApplicationState = {
  currentTab: WorkspaceTab;
  currentThemeTab: ThemeTab;
  interactionState: InteractionState;
  keyModifiers: KeyModifiers;
  selectedPage: string;
  selectedObjects: string[];
  selectedPointLists: SelectedPointLists;
  selectedControlPoint?: SelectedControlPoint;
  selectedThemeTab: Record<ThemeTab, ThemeSelection>;
  selectedGradient?: SelectedGradient;
  sketch: SketchFile;
};

export type Action =
  | [type: 'setTab', value: WorkspaceTab]
  | [type: 'setKeyModifier', name: keyof KeyModifiers, value: boolean]
  | [type: 'setSelectedGradient', value: SelectedGradient | undefined]
  | [type: 'setSelectedGradientStopIndex', value: number]
  | PageAction
  | CanvasAction
  | LayerPropertyAction
  | LayerAction
  | AlignmentAction
  | StyleAction
  | TextStyleAction
  | ThemeAction
  | SymbolsAction
  | ExportAction
  | PointAction
  | TextEditorAction;

export type ApplicationReducerContext = {
  canvasInsets: Insets;
  canvasSize: Size;
  fontManager: IFontManager;
};

export function applicationReducer(
  state: ApplicationState,
  action: Action,
  CanvasKit: CanvasKit,
  context: ApplicationReducerContext,
): ApplicationState {
  switch (action[0]) {
    case 'setKeyModifier':
      const [, name, value] = action;
      return produce(state, (draft) => {
        draft.keyModifiers[name] = value;
      });
    case 'setTab': {
      const [, value] = action;
      return produce(state, (draft) => {
        draft.currentTab = value;
        draft.interactionState = interactionReducer(draft.interactionState, [
          'reset',
        ]);
      });
    }
    case 'setSelectedGradient': {
      const [, value] = action;
      const pageIndex = getCurrentPageIndex(state);

      return produce(state, (draft) => {
        if (state.selectedGradient && !value) {
          const gradient = getSelectedGradient(
            draft.sketch.pages[pageIndex],
            state.selectedGradient,
          );

          if (gradient) {
            fixGradientPositions(gradient);
          }
        }

        draft.selectedGradient = value;
      });
    }
    case 'setSelectedGradientStopIndex': {
      const [, value] = action;
      return produce(state, (draft) => {
        if (!draft.selectedGradient) return;

        draft.selectedGradient.stopIndex = value;
      });
    }
    case 'selectPage':
    case 'addPage':
    case 'setPageName':
    case 'duplicatePage':
    case 'deletePage':
    case 'movePage': {
      return pageReducer(state, action);
    }
    case 'setZoom':
    case 'insertArtboard':
    case 'addDrawnLayer':
    case 'addShapePathLayer':
    case 'addSymbolLayer':
    case 'addPointToPath':
    case 'pan':
    case 'importImage':
    case 'interaction':
    case 'moveLayersIntoParentAtPoint':
    case 'insertPointInPath':
    case 'addStopToGradient':
    case 'deleteStopToGradient':
      return canvasReducer(state, action, CanvasKit, context);
    case 'setLayerVisible':
    case 'setLayerName':
    case 'setLayerIsLocked':
    case 'setExpandedInLayerList':
    case 'setFixedRadius':
    case 'setLayerX':
    case 'setLayerY':
    case 'setLayerWidth':
    case 'setLayerHeight':
    case 'setLayerRotation':
    case 'setIsClosed':
    case 'setIsFlippedHorizontal':
    case 'setIsFlippedVertical':
    case 'setHasClippingMask':
    case 'setShouldBreakMaskChain':
    case 'setMaskMode':
      return layerPropertyReducer(state, action, CanvasKit);
    case 'groupLayers':
    case 'deleteLayer':
    case 'moveLayer':
    case 'selectLayer':
    case 'selectAllLayers':
    case 'ungroupLayers':
    case 'createSymbol':
    case 'detachSymbol':
    case 'deleteSymbol':
    case 'duplicateLayer':
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
    case 'setShadowSpread':
    case 'setFillFillType':
    case 'setBorderFillType':
    case 'setFillGradientColor':
    case 'setFillGradientPosition':
    case 'setFillGradientType':
    case 'setFillGradient':
    case 'addFillGradientStop':
    case 'deleteFillGradientStop':
    case 'setBorderGradient':
    case 'setBorderGradientColor':
    case 'setBorderGradientPosition':
    case 'setBorderGradientType':
    case 'addBorderGradientStop':
    case 'deleteBorderGradientStop':
    case 'setColorControlsEnabled':
    case 'setHue':
    case 'setSaturation':
    case 'setBrightness':
    case 'setContrast':
    case 'setBlurEnabled':
    case 'setBlurRadius':
    case 'setBlurType':
    case 'setBlurSaturation':
    case 'setPatternFillType':
    case 'setPatternTileScale':
    case 'setFillImage':
    case 'setFillContextSettingsOpacity':
    case 'setFillGradientFrom':
    case 'setBorderGradientFrom':
    case 'setFillGradientTo':
    case 'setBorderGradientTo':
    case 'setShaderString':
    case 'setShaderVariableName':
    case 'setShaderVariableValue':
    case 'addShaderVariable':
    case 'deleteShaderVariable': {
      if (getCurrentTab(state) === 'canvas') {
        const pageIndex = getCurrentPageIndex(state);
        const layerIndexPaths = getSelectedLayerIndexPaths(state);

        return produce(state, (draft) => {
          accessPageLayers(draft, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              if (!layer.style) return;

              if (action[0] === 'setFillFillType' && layer.style.fills) {
                switch (action[2]) {
                  case Sketch.FillType.Pattern:
                    setNewPatternFill(layer.style.fills, action[1], draft);
                    break;
                  case Sketch.FillType.Shader:
                    setNewShaderFill(layer.style.fills, action[1]);
                    break;
                }
              }

              if (
                action[0] === 'setFillGradientPosition' ||
                action[0] === 'setBorderGradientPosition'
              ) {
                const [, , stopIndex, position] = action;

                if (!draft.selectedGradient) return;

                const { fillIndex, styleType } = draft.selectedGradient;

                const draftGradient =
                  layer.style?.[styleType]?.[fillIndex].gradient;

                if (!draftGradient) return;

                const draftStop = draftGradient.stops[stopIndex];
                draftStop.position = position;

                draftGradient.stops.sort((a, b) => a.position - b.position);
                const newIndex = draftGradient.stops.findIndex(
                  (s) => s === draftStop,
                );

                draft.selectedGradient.stopIndex = newIndex;
              } else {
                layer.style = styleReducer(layer.style, action);
              }
            },
          );
        });
      } else {
        const ids = state.selectedThemeTab.layerStyles.ids;

        const layerIndexPathsWithSharedStyle = findPageLayerIndexPaths(
          state,
          (layer) =>
            layer.sharedStyleID !== undefined &&
            ids.includes(layer.sharedStyleID),
        );

        const currentComponentsTab = getCurrentComponentsTab(state);

        const selectedIds = state.selectedThemeTab[currentComponentsTab].ids;

        return produce(state, (draft) => {
          const styles =
            currentComponentsTab === 'layerStyles'
              ? draft.sketch.document.layerStyles?.objects
              : draft.sketch.document.layerTextStyles?.objects ?? [];

          styles.forEach((style) => {
            if (!selectedIds.includes(style.do_objectID)) return;

            style.value = styleReducer(style.value, action);

            if (action[0] === 'setFillFillType' && style.value.fills) {
              switch (action[2]) {
                case Sketch.FillType.Pattern:
                  setNewPatternFill(style.value.fills, action[1], draft);
                  break;
                case Sketch.FillType.Shader:
                  setNewShaderFill(style.value.fills, action[1]);
                  break;
              }
            }

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
    case 'setTextTransform': {
      state = textStyleReducer(state, action);

      const indexPaths = Selectors.getSelectedLayerIndexPaths(state);
      const pageIndex = Selectors.getCurrentPageIndex(state);

      state = produce(state, (draft) => {
        indexPaths.forEach((indexPath) => {
          const draftLayer = Layers.access(
            draft.sketch.pages[pageIndex],
            indexPath,
          );

          if (!draftLayer || !Layers.isTextLayer(draftLayer)) return;

          const paragraph = getLayerParagraph(
            CanvasKit,
            context.fontManager,
            draftLayer,
          );

          draftLayer.frame.width = paragraph.getMaxWidth();
          draftLayer.frame.height = paragraph.getHeight();
        });
      });

      return state;
    }
    case 'setAdjustContentOnResize':
    case 'setHasBackgroundColor':
    case 'setBackgroundColor':
    case 'setIncludeBackgroundColorInExport':
    case 'setIncludeBackgroundColorInInstance':
    case 'setLayoutAxis':
    case 'setLayoutAnchor':
    case 'setMinWidth':
    case 'setAllowsOverrides':
    case 'onSetOverrideProperty':
    case 'setInstanceSymbolSource':
    case 'goToSymbolSource':
    case 'setOverrideValue':
      return symbolsReducer(state, action);
    case 'moveExportFormat':
    case 'setExportScale':
    case 'setExportName':
    case 'setExportFileFormat':
    case 'setExportNamingScheme':
    case 'addExportFormat':
    case 'deleteExportFormat':
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          layer.exportOptions = exportReducer(
            layer.exportOptions,
            action,
            layer.frame,
          );
        });
      });
    case 'setPointCurveMode':
    case 'setPointCornerRadius':
    case 'setPointX':
    case 'setPointY':
    case 'setControlPointX':
    case 'setControlPointY': {
      return markLayersAsEdited(pointReducer(state, action, CanvasKit));
    }
    case 'selectPoint':
    case 'selectControlPoint':
      return pointReducer(state, action, CanvasKit);
    case 'setTextSelection':
    case 'selectAllText':
    case 'selectContainingText':
    case 'moveCursor':
    case 'moveTextSelection':
    case 'insertText':
    case 'deleteText':
      return textEditorReducer(state, action, CanvasKit, context);
    default:
      return themeReducer(state, action);
  }
}

/*
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
    keyModifiers: {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
    },
    selectedPage: sketch.pages[0].do_objectID,
    selectedObjects: [],
    selectedPointLists: {},
    selectedControlPoint: undefined,
    selectedThemeTab: {
      swatches: { ids: [], groupName: '' },
      layerStyles: { ids: [], groupName: '' },
      textStyles: { ids: [], groupName: '' },
      symbols: { ids: [], groupName: '' },
    },
    sketch,
  };
}
