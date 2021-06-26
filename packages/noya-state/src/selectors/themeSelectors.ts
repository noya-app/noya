import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { delimitedPath } from 'noya-utils';
import { Layers } from '..';
import { Draft } from 'immer';
import { ApplicationState } from '../reducers/applicationReducer';
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
    state.selectedSwatchIds.includes(swatch.do_objectID),
  );
};

export const getSelectedLayerStyles = (
  state: ApplicationState,
): Sketch.SharedStyle[] => {
  const sharedStyles = getSharedStyles(state);

  return sharedStyles.filter((swatch) =>
    state.selectedLayerStyleIds.includes(swatch.do_objectID),
  );
};

export const getSelectedThemeTextStyles = (
  state: ApplicationState,
): Sketch.SharedStyle[] => {
  const sharedStyles = getSharedTextStyles(state);

  return sharedStyles.filter((swatch) =>
    state.selectedTextStyleIds.includes(swatch.do_objectID),
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
  return state.sketch.pages.flatMap((p) =>
    p.layers.flatMap((l) => (Layers.isSymbolMaster(l) ? [l] : [])),
  );
};

export const getSelectedSymbols = (
  state: ApplicationState | Draft<ApplicationState>,
): Sketch.SymbolMaster[] => {
  const symbols = getSymbols(state);

  const filter =
    getCurrentTab(state) === 'canvas'
      ? state.selectedObjects
      : state.selectedSymbolsIds;

  return symbols.filter((symbol) => filter.includes(symbol.do_objectID));
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
