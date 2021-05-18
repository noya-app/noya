import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { delimitedPath } from 'noya-utils';
import { ApplicationState } from '../reducers/applicationReducer';

export const getSharedSwatches = (state: ApplicationState): Sketch.Swatch[] => {
  return state.sketch.document.sharedSwatches?.objects ?? [];
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

export function groupThemeComponents<
  T extends Sketch.Swatch | Sketch.SharedStyle
>(currentIds: string[], groupName: string | undefined, array: T[]) {
  array.forEach((object: T) => {
    if (!currentIds.includes(object.do_objectID)) return;
    const prevGroup = groupName ? delimitedPath.dirname(object.name) : '';
    const name = delimitedPath.basename(object.name);
    const newName = delimitedPath.join([prevGroup, groupName, name]);

    object.name = newName;
  });

  return array;
}

export const getSymbols = (state: ApplicationState): Sketch.SymbolMaster[] => {
  const symbols: Sketch.SymbolMaster[] = [];

  state.sketch.pages.forEach((p) =>
    symbols.push(
      ...p.layers.flatMap((l) => (l._class === 'symbolMaster' ? [l] : [])),
    ),
  );

  return symbols;
};

export const getSelectedSymbols = (
  state: ApplicationState,
): Sketch.SymbolMaster[] => {
  const symbols = getSymbols(state);

  return symbols.filter((symbol) =>
    state.selectedSymbolsIds.includes(symbol.do_objectID),
  );
};
