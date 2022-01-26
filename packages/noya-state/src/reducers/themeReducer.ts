import produce from 'immer';

import Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import { delimitedPath, getIncrementedName, uuid } from 'noya-utils';
import * as Layers from '../layers';
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
  SetNumberMode,
  ThemeTab,
} from './applicationReducer';

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
  | [type: `addSwatch`, name?: string, color?: Sketch.Color, id?: string]
  | [type: `addGradientAsset`, name: string, value: Sketch.Gradient]
  | [
      type: `add${Exclude<ComponentsElements, 'Swatch'>}`,
      name?: string,
      style?: Sketch.Style,
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
      type: `set${ComponentsElements | 'Symbol' | 'GradientAsset'}Name`,
      id: string | string[],
      name: string,
    ]
  | [type: `remove${ComponentsElements}`]
  | [type: `removeGradientAsset`, id: string | string[]]
  | [type: `setSelected${ComponentsElements | 'Symbol'}Group`, groupId: string]
  | [
      type: `group${ComponentsElements | 'Symbol'}`,
      id: string | string[],
      name: string | undefined,
    ]
  | [type: 'setThemeStyle', sharedStyleId?: string]
  | [type: 'setTextStyle', sharedStyleId?: string]
  | [type: 'setSwatchColor', swatchId: string | string[], color: Sketch.Color]
  | [type: 'addImage', image: ArrayBuffer, _ref: string];

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
      const [, name, color, id] = action;
      const currentTab = state.currentTab;

      return produce(state, (draft) => {
        const sharedSwatches = draft.sketch.document.sharedSwatches ?? {
          _class: 'swatchContainer',
          do_objectID: uuid(),
          objects: [],
        };

        const swatches = draft.selectedThemeTab.swatches;
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
          do_objectID: id ?? uuid(),
          name: delimitedPath.join([
            swatches.groupName,
            name || 'New Theme Color',
          ]),
          value: swatchColor,
        };

        sharedSwatches.objects.push(swatch);
        draft.sketch.document.sharedSwatches = sharedSwatches;

        if (currentTab === 'theme') {
          swatches.ids = [swatch.do_objectID];
        }
      });
    }
    case 'addTextStyle': {
      const [, name, style] = action;
      const pageIndex = getCurrentPageIndex(state);
      const layerIndexPaths = getSelectedLayerIndexPaths(state);
      const currentTab = state.currentTab;

      return produce(state, (draft) => {
        const textStyles = draft.sketch.document.layerTextStyles ?? {
          _class: 'sharedTextStyleContainer',
          do_objectID: uuid(),
          objects: [],
        };

        const draftTextStyles = draft.selectedThemeTab.textStyles;
        const sharedStyle: Sketch.SharedStyle = {
          _class: 'sharedStyle',
          do_objectID: uuid(),
          name: delimitedPath.join([
            draftTextStyles.groupName,
            name || 'New Text Style',
          ]),

          value: produce(
            style ||
              SketchModel.style({
                textStyle: SketchModel.textStyle(),
              }),
            (style) => {
              style.do_objectID = uuid();
              return style;
            },
          ),
        };

        textStyles.objects.push(sharedStyle);
        draft.sketch.document.layerTextStyles = textStyles;

        if (currentTab === 'theme') {
          draftTextStyles.ids = [sharedStyle.do_objectID];
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
        const layerStyles = draft.sketch.document.layerStyles ?? {
          _class: 'sharedStyleContainer',
          do_objectID: uuid(),
          objects: [],
        };

        const draftLayerStyles = draft.selectedThemeTab.layerStyles;

        const sharedStyle: Sketch.SharedStyle = {
          _class: 'sharedStyle',
          do_objectID: uuid(),
          name: delimitedPath.join([
            draftLayerStyles.groupName,
            name || 'New Layer Style',
          ]),
          value: style
            ? produce(style, (style) => {
                style.do_objectID = uuid();
                return style;
              })
            : SketchModel.style(),
        };

        layerStyles.objects.push(sharedStyle);
        draft.sketch.document.layerStyles = layerStyles;

        if (currentTab === 'theme') {
          draftLayerStyles.ids = [sharedStyle.do_objectID];
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
    case 'selectTextStyle':
    case 'selectSymbol': {
      const [, id, selectionType = 'replace'] = action;

      const currentThemeTab = state.currentThemeTab;
      return produce(state, (draft) => {
        updateSelection(
          draft.selectedThemeTab[currentThemeTab].ids,
          id,
          selectionType,
        );
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
      const ids = state.selectedThemeTab.swatches.ids;

      const layerIndexPathsWithSwatchId = findPageLayerIndexPaths(
        state,
        (layer) =>
          layer.style !== undefined &&
          layer.style.fills !== undefined &&
          layer.style.fills.some(
            (f) => f.color.swatchID && ids.includes(f.color.swatchID),
          ),
      );

      return produce(state, (draft) => {
        const sharedSwatches = draft.sketch.document.sharedSwatches;

        if (!sharedSwatches) return;

        const filterSwatches = sharedSwatches.objects.filter(
          (object: Sketch.Swatch) => !ids.includes(object.do_objectID),
        );
        sharedSwatches.objects = filterSwatches;

        draft.sketch.document.sharedSwatches = sharedSwatches;

        layerIndexPathsWithSwatchId.forEach((layerPath) =>
          accessPageLayers(
            draft,
            layerPath.pageIndex,
            layerPath.indexPaths,
          ).forEach((layer) => {
            layer.style?.fills?.forEach((f) => {
              if (f.color.swatchID && ids.includes(f.color.swatchID))
                delete f.color.swatchID;
            });
          }),
        );
      });
    }
    case 'removeTextStyle': {
      const ids = state.selectedThemeTab.textStyles.ids;

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
      const ids = state.selectedThemeTab.layerStyles.ids;

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
    case 'setSelectedTextStyleGroup':
    case 'setSelectedSymbolGroup': {
      const [, id] = action;
      const currentThemeTab = state.currentThemeTab;

      return produce(state, (draft) => {
        draft.selectedThemeTab[currentThemeTab].groupName = id;
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
        draft.selectedThemeTab.swatches.groupName = '';
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

        draft.selectedThemeTab.textStyles.groupName = '';
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
        draft.selectedThemeTab.layerStyles.groupName = '';
      });
    }
    case 'groupSymbol': {
      const [, id, value] = action;
      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        groupThemeComponents(ids, value, getSymbols(draft));
        draft.selectedThemeTab.symbols.groupName = '';
      });
    }
    case 'addGradientAsset': {
      const [, name, value] = action;

      return produce(state, (draft) => {
        const assets = draft.sketch.document.assets;

        const newAsset: Sketch.GradientAsset = {
          _class: 'MSImmutableGradientAsset',
          do_objectID: uuid(),
          name: name,
          gradient: value,
        };

        assets.gradientAssets.push(newAsset);
        assets.gradients.push(value);
      });
    }
    case 'removeGradientAsset': {
      const [, id] = action;
      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        const assets = draft.sketch.document.assets;

        const indexes = assets.gradientAssets.flatMap((g, index) =>
          ids.includes(g.do_objectID) ? [index] : [],
        );

        indexes.reverse().forEach((index) => {
          assets.gradients.splice(index, 1);
          assets.gradientAssets.splice(index, 1);
        });
      });
    }
    case 'setGradientAssetName': {
      const [, id, name] = action;
      const ids = typeof id === 'string' ? [id] : id;

      return produce(state, (draft) => {
        const gradientAssets = draft.sketch.document.assets.gradientAssets;

        gradientAssets.forEach((g) => {
          if (ids.includes(g.do_objectID)) g.name = name;
        });
      });
    }
    case 'addImage': {
      const [, file, _ref] = action;

      return produce(state, (draft) => {
        draft.sketch.images[_ref] = file;
        draft.sketch.document.assets.images.push({
          _class: 'MSJSONFileReference',
          _ref: _ref,
          _ref_class: 'MSImageData',
        });
      });
    }
    default:
      return state;
  }
}
