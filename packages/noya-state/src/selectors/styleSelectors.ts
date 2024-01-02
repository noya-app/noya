import type { Sketch } from '@noya-app/noya-file-format';
import type { ApplicationState } from '../reducers/applicationReducer';
import { getSelectedLayers } from './layerSelectors';
import {
  getSelectedLayerStyles,
  getSelectedThemeTextStyles,
} from './themeSelectors';
import { getCurrentComponentsTab, getCurrentTab } from './workspaceSelectors';

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
