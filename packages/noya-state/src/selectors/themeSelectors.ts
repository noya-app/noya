import { Draft } from 'immer';
import type Sketch from 'noya-file-format';
import { SketchModel } from 'noya-sketch-model';
import { delimitedPath, uuid } from 'noya-utils';
import { CHECKERED_BACKGROUND_BYTES } from '../checkeredBackground';
import { Layers } from '../layer';
import type { ApplicationState } from '../reducers/applicationReducer';
import { findPageLayerIndexPaths, LayerIndexPaths } from './indexPathSelectors';
import { getCurrentTab } from './workspaceSelectors';

export type ComponentsTypes =
  | Sketch.Swatch
  | Sketch.SharedStyle
  | Sketch.SymbolMaster;

export const getSharedSwatches = (state: ApplicationState): Sketch.Swatch[] => {
  return state.sketch.document.sharedSwatches?.objects ?? [];
};

export const getGradientAssets = (
  state: ApplicationState,
): Sketch.GradientAsset[] => {
  return state.sketch.document.assets.gradientAssets ?? [];
};

export const getImageAssets = (
  state: ApplicationState,
): (Sketch.FileRef | Sketch.DataRef)[] => {
  return state.sketch.document.assets.images ?? [];
};

export const getSharedTextStyles = (
  state: ApplicationState,
): Sketch.SharedStyle[] => {
  return state.sketch.document.layerTextStyles?.objects ?? [];
};

export const getSharedStyles = (
  state: ApplicationState,
): Sketch.SharedStyle[] => {
  return state.sketch.document.layerStyles?.objects ?? [];
};

export const getSelectedSwatches = (
  state: ApplicationState,
): Sketch.Swatch[] => {
  const sharedSwatches = getSharedSwatches(state);

  return sharedSwatches.filter((swatch) =>
    state.selectedThemeTab.swatches.ids.includes(swatch.do_objectID),
  );
};

export const getSelectedLayerStyles = (
  state: ApplicationState,
): Sketch.SharedStyle[] => {
  const sharedStyles = getSharedStyles(state);

  return sharedStyles.filter((swatch) =>
    state.selectedThemeTab.layerStyles.ids.includes(swatch.do_objectID),
  );
};

export const getSelectedThemeTextStyles = (
  state: ApplicationState,
): Sketch.SharedStyle[] => {
  const sharedStyles = getSharedTextStyles(state);

  return sharedStyles.filter((swatch) =>
    state.selectedThemeTab.textStyles.ids.includes(swatch.do_objectID),
  );
};

export function groupThemeComponents<T extends ComponentsTypes>(
  currentIds: string[],
  groupName: string | undefined,
  array: T[],
) {
  array.forEach((object: T) => {
    if (!currentIds.includes(object.do_objectID)) return;
    const prevGroup = groupName ? delimitedPath.dirname(object.name) : '';
    const name = delimitedPath.basename(object.name);
    const newName = delimitedPath.join([prevGroup, groupName, name]);

    object.name = newName;
  });

  return array;
}

export function setComponentName<T extends ComponentsTypes>(
  ids: string[],
  name: string,
  array: T[],
) {
  array.forEach((object: ComponentsTypes) => {
    if (!ids.includes(object.do_objectID)) return;

    const group = delimitedPath.dirname(object.name);
    object.name = delimitedPath.join([group, name]);
  });
}

export const getSymbols = (
  state: Draft<ApplicationState>,
): Sketch.SymbolMaster[] => {
  return [
    ...state.sketch.pages.flatMap((p) =>
      p.layers.flatMap((l) => (Layers.isSymbolMaster(l) ? [l] : [])),
    ),
    ...state.sketch.document.foreignSymbols.map((s) => s.symbolMaster),
  ];
};

export const getSymbolMaster = (state: ApplicationState, symbolId: string) => {
  return getSymbols(state).find(
    (layer) => layer.symbolID === symbolId,
  ) as Sketch.SymbolMaster;
};

export const getSelectedSymbols = (
  state: ApplicationState | Draft<ApplicationState>,
): Sketch.SymbolMaster[] => {
  const symbols = getSymbols(state);

  const selectedIds =
    getCurrentTab(state) === 'canvas'
      ? state.selectedLayerIds
      : state.selectedThemeTab.symbols.ids;

  return symbols.filter((symbol) => selectedIds.includes(symbol.do_objectID));
};

export const getSymbolsInstancesIndexPaths = (
  state: ApplicationState,
  symbolMasterId: string,
): LayerIndexPaths[] =>
  findPageLayerIndexPaths(
    state,
    (layer) =>
      Layers.isSymbolInstance(layer) && layer.symbolID === symbolMasterId,
  ).filter((l) => l.indexPaths.length);

export const getSymbolsInstancesIds = (
  state: ApplicationState,
  symbolMasterId: string,
): string[] => {
  return state.sketch.pages.flatMap((p, index) =>
    p.layers.flatMap((l) =>
      Layers.isSymbolInstance(l) && l.symbolID === symbolMasterId
        ? [l.do_objectID]
        : [],
    ),
  );
};

export const setNewPatternFill = (
  fills: Sketch.Fill[],
  index: number,
  draft: Draft<ApplicationState>,
) => {
  if (fills[index].image) return;

  const _ref = `images/${uuid()}.png`;
  fills[index].image = {
    _class: 'MSJSONFileReference',
    _ref: _ref,
    _ref_class: 'MSImageData',
  };
  draft.sketch.images[_ref] = CHECKERED_BACKGROUND_BYTES;
};

export const setNewShaderFill = (fills: Sketch.Fill[], index: number) => {
  if (fills[index].shader) return;

  fills[index].shader = {
    _class: 'shader',
    shaderString: `float4 main(float2 position) {
  float x = floor(position.x / iResolution.x * 10) / 10;
  float y = floor(position.y / iResolution.y * 10) / 10;
  return mix(color1, color2, (x + y) / 2);
}
`,
    variables: [
      {
        _class: 'shaderVariable',
        name: 'color2',
        value: {
          type: 'color',
          data: SketchModel.color({ red: 0, green: 0, blue: 1 }),
        },
      },
      {
        _class: 'shaderVariable',
        name: 'color1',
        value: {
          type: 'color',
          data: SketchModel.color({ red: 1, green: 0, blue: 0 }),
        },
      },
    ],
  };
};
