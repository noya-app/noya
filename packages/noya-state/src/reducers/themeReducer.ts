import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { uuid } from 'noya-renderer';
import { delimitedPath, getIncrementedName } from 'noya-utils';
import * as Layers from '../layers';
import * as Models from '../models';
import {
  findPageLayerIndexPaths,
  getCurrentPageIndex,
  getSelectedLayerIndexPaths,
  getSymbols,
  groupThemeComponents,
  setComponentName,
  visitLayerColors,
  visitStyleColors,
} from '../selectors/selectors';
import { SelectionType, updateSelection } from '../utils/selection';
import {
  accessPageLayers,
  ApplicationState,
  ThemeTab,
} from './applicationReducer';
import { SetNumberMode } from './styleReducer';

export type ComponentsElements = 'Swatch' | 'TextStyle' | 'ThemeStyle';

export type ComponentsTypes =
  | Sketch.Swatch
  | Sketch.SharedStyle
  | Sketch.SymbolMaster;

export type ThemeAction =
  | [type: 'setThemeTab', value: ThemeTab]
  | [
      type: `select${ComponentsElements | 'Symbol'}`,
      id: string | string[] | undefined,
      selectionType?: SelectionType,
    ]
  | [
      type: 'setSwatchOpacity',
      swatchId: string | string[],
      alpha: number,
      mode?: SetNumberMode,
    ]
  | [
      type: `add${ComponentsElements}`,
      name?: string,
      style?: Sketch.Style | Sketch.Color,
    ]
  | [
      type: 'updateThemeStyle',
      sharedStyleId: string,
      style: Sketch.Style | undefined,
    ]
  | [
      type: 'updateTextStyle',
      sharedStyleId: string,
      style: Sketch.Style | undefined,
    ]
  | [type: `duplicate${ComponentsElements}`, id: string[]]
  | [
      type: `set${ComponentsElements | 'Symbol'}Name`,
      id: string | string[],
      name: string,
    ]
  | [type: `remove${ComponentsElements}`]
  | [type: `setSelected${ComponentsElements | 'Symbol'}Group`, groupId: string]
  | [
      type: `group${ComponentsElements | 'Symbol'}`,
      id: string | string[],
      name: string | undefined,
    ]
  | [type: 'setThemeStyle', sharedStyleId?: string]
  | [type: 'setTextStyle', sharedStyleId?: string]
  | [type: 'setSwatchColor', swatchId: string | string[], color: Sketch.Color];

export function themeReducer(
  state: ApplicationState,
  action: ThemeAction,
): ApplicationState {
  switch (action[0]) {
    case 'setThemeTab': {
      const [, value] = action;

      return produce(state, (draft) => {
        draft.currentThemeTab = value;
      });
    }
    case 'addSwatch': {
      const [, name, color] = action;
      const currentTab = state.currentTab;

      return produce(state, (draft) => {
        if (color && color._class === 'style') return;

        const sharedSwatches = draft.sketch.document.sharedSwatches ?? {
          _class: 'swatchContainer',
          do_objectID: uuid(),
          objects: [],
        };

        const swatchColor: Sketch.Color = color
          ? color
          : {
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
            name || 'New Theme Color',
          ]),
          value: swatchColor,
        };

        sharedSwatches.objects.push(swatch);
        draft.sketch.document.sharedSwatches = sharedSwatches;

        if (currentTab === 'theme') {
          draft.selectedSwatchIds = [swatch.do_objectID];
        } else {
          /*accessPageLayers(draft, pageIndex, layerIndexPaths).forEach(
            (layer) => {
              layer.sharedStyleID = sharedStyle.do_objectID;
            },
          );*/
        }
      });
    }
    case 'addTextStyle': {
      const [, name, style] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);
      const currentTab = state.currentTab;

      return produce(state, (draft) => {
        if (style && style._class === 'color') return;

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

          value: produce(style || Models.textStyle, (style) => {
            style.do_objectID = uuid();
            return style;
          }),
        };

        textStyles.objects.push(sharedStyle);
        draft.sketch.document.layerTextStyles = textStyles;

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
    case 'addThemeStyle': {
      const [, name, style] = action;

      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      const currentTab = state.currentTab;
      return produce(state, (draft) => {
        if (style && style._class === 'color') return;

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
    case 'selectSwatch': {
      const [, id, selectionType = 'replace'] = action;

      return produce(state, (draft) => {
        updateSelection(draft.selectedSwatchIds, id, selectionType);
      });
    }
    case 'selectThemeStyle': {
      const [, id, selectionType = 'replace'] = action;

      return produce(state, (draft) => {
        updateSelection(draft.selectedLayerStyleIds, id, selectionType);
      });
    }
    case 'selectTextStyle': {
      const [, id, selectionType = 'replace'] = action;

      return produce(state, (draft) => {
        updateSelection(draft.selectedTextStyleIds, id, selectionType);
      });
    }
    case 'selectSymbol': {
      const [, id, selectionType = 'replace'] = action;

      return produce(state, (draft) => {
        updateSelection(draft.selectedSymbolsIds, id, selectionType);
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
    case 'setThemeStyleName': {
      const [, id, name] = action;

      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        setComponentName(
          ids,
          name,
          draft.sketch.document.layerStyles?.objects ?? [],
        );
      });
    }
    case 'setTextStyleName': {
      const [, id, name] = action;

      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        setComponentName(
          ids,
          name,
          draft.sketch.document.layerTextStyles?.objects,
        );
      });
    }
    case 'setSwatchName': {
      const [, id, name] = action;

      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        setComponentName(
          ids,
          name,
          draft.sketch.document.sharedSwatches?.objects ?? [],
        );
      });
    }
    case 'setSymbolName': {
      const [, id, name] = action;

      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        setComponentName(ids, name, getSymbols(draft));
      });
    }
    case 'setThemeStyle':
    case 'setTextStyle': {
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);

      const [, id] = action;

      return produce(state, (draft) => {
        accessPageLayers(draft, pageIndex, layerIndexPaths).forEach((layer) => {
          const style =
            action[0] === 'setThemeStyle'
              ? draft.sketch.document.layerStyles?.objects.find(
                  (s) => s.do_objectID === id,
                )
              : draft.sketch.document.layerTextStyles?.objects.find(
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
    case 'updateThemeStyle':
    case 'updateTextStyle': {
      const [, id, style] = action;
      const layerIndexPathsWithSharedStyle = findPageLayerIndexPaths(
        state,
        (layer) =>
          layer.sharedStyleID !== undefined && id === layer.sharedStyleID,
      );
      return produce(state, (draft) => {
        if (!style) return;

        const sharedStyles =
          action[0] === 'updateThemeStyle'
            ? draft.sketch.document.layerStyles.objects
            : draft.sketch.document.layerTextStyles?.objects;
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
    case 'setSelectedSwatchGroup': {
      const [, id] = action;
      return produce(state, (draft) => {
        draft.selectedSwatchGroup = id;
      });
    }
    case 'setSelectedThemeStyleGroup': {
      const [, id] = action;
      return produce(state, (draft) => {
        draft.selectedThemeStyleGroup = id;
      });
    }
    case 'setSelectedTextStyleGroup': {
      const [, id] = action;
      return produce(state, (draft) => {
        draft.selectedTextStyleGroup = id;
      });
    }
    case 'setSelectedSymbolGroup': {
      const [, id] = action;
      return produce(state, (draft) => {
        draft.selectedSymbolGroup = id;
      });
    }
    case 'groupSwatch': {
      const [, id, value] = action;
      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        groupThemeComponents(
          ids,
          value,
          draft.sketch.document.sharedSwatches?.objects ?? [],
        );
        draft.selectedSwatchGroup = '';
      });
    }
    case 'groupTextStyle': {
      const [, id, value] = action;
      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        groupThemeComponents(
          ids,
          value,
          draft.sketch.document.layerTextStyles.objects ?? [],
        );

        draft.selectedThemeStyleGroup = '';
      });
    }
    case 'groupThemeStyle': {
      const [, id, value] = action;
      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        groupThemeComponents(
          ids,
          value,
          draft.sketch.document.layerStyles?.objects ?? [],
        );
        draft.selectedTextStyleGroup = '';
      });
    }
    case 'groupSymbol': {
      const [, id, value] = action;
      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        groupThemeComponents(ids, value, getSymbols(draft));
        draft.selectedSymbolGroup = '';
      });
    }
    default:
      return state;
  }
}
