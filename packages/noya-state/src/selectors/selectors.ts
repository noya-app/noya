import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { ApplicationState, Layers, PageLayer } from '../index';
import { ThemeTab, WorkspaceTab } from '../reducers/application';
import type { UUID } from '../types';
import { getSelectedLayerIndexPathsExcludingDescendants } from './indexPathSelectors';
import { getCurrentPage, getCurrentPageIndex } from './pageSelectors';
import {
  getSelectedLayerStyles,
  getSelectedThemeTextStyles,
} from './themeSelectors';

export * from './geometrySelectors';
export * from './indexPathSelectors';
export * from './pageSelectors';
export * from './themeSelectors';
export * from './transformSelectors';

export const getCurrentTab = (state: ApplicationState): WorkspaceTab => {
  return state.currentTab;
};

export const getCurrentComponentsTab = (state: ApplicationState): ThemeTab => {
  return state.currentThemeTab;
};

export const getSelectedLayersExcludingDescendants = (
  state: ApplicationState,
): Sketch.AnyLayer[] => {
  const pageIndex = getCurrentPageIndex(state);

  return getSelectedLayerIndexPathsExcludingDescendants(state).map(
    (layerIndex) => {
      return Layers.access(state.sketch.pages[pageIndex], layerIndex);
    },
  );
};

export const getSelectedStyles = (state: ApplicationState): Sketch.Style[] => {
  const currentTab = getCurrentTab(state);
  const currentComponentsTab = getCurrentComponentsTab(state);

  return currentTab === 'canvas'
    ? getSelectedLayers(state).flatMap((layer) =>
        layer.style ? [layer.style] : [],
      )
    : currentComponentsTab === 'layerStyles'
    ? getSelectedLayerStyles(state).map((style) => style.value)
    : getSelectedThemeTextStyles(state).map((style) => style.value);
};

export const getSelectedTextLayers = (
  state: ApplicationState,
): Sketch.Text[] => {
  return getSelectedLayers(state).filter(
    (layer): layer is Sketch.Text => layer._class === 'text',
  );
};

export const getSelectedLayers = (state: ApplicationState): PageLayer[] => {
  const page = getCurrentPage(state);

  return Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ) as PageLayer[];
};

export const getSelectedLayersWithContextSettings = (
  state: ApplicationState,
): PageLayer[] => {
  const page = getCurrentPage(state);

  return (Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ) as PageLayer[]).filter(
    (layer) => layer._class !== 'artboard' && layer.style?.contextSettings,
  );
};

export const getSelectedLayersWithFixedRadius = (
  state: ApplicationState,
): Sketch.Rectangle[] => {
  const page = getCurrentPage(state);

  return Layers.findAll(page, (layer) =>
    state.selectedObjects.includes(layer.do_objectID),
  ).filter((layer): layer is Sketch.Rectangle => layer._class === 'rectangle');
};

export const makeGetPageLayers = (
  state: ApplicationState,
): ((ids: UUID[]) => PageLayer[]) => {
  const page = getCurrentPage(state);

  return (ids: UUID[]) =>
    ids
      .map((id) => page.layers.find((layer) => layer.do_objectID === id))
      .filter((layer): layer is PageLayer => !!layer);
};

export function visitStyleColors(
  style: Sketch.Style,
  f: (color: Sketch.Color) => void,
): void {
  if (style?.textStyle?.encodedAttributes.MSAttributedStringColorAttribute) {
    f(style?.textStyle?.encodedAttributes.MSAttributedStringColorAttribute);
  }
  style?.fills?.forEach((fill) => f(fill.color));
  style?.borders?.forEach((border) => f(border.color));
  style?.shadows?.forEach((shadow) => f(shadow.color));
  style?.innerShadows.forEach((fill) => f(fill.color));
}

export function visitLayerColors(
  layer: Sketch.AnyLayer,
  f: (color: Sketch.Color) => void,
) {
  if (layer.style) visitStyleColors(layer.style, f);

  if (layer._class === 'text') {
    const attributes = layer.attributedString.attributes;
    if (attributes) {
      attributes.forEach((a) => {
        if (a.attributes.MSAttributedStringColorAttribute)
          f(a.attributes.MSAttributedStringColorAttribute);
      });
    }
  }
}
