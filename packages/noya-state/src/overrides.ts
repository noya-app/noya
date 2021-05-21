import type Sketch from '@sketch-hq/sketch-file-format-ts';
import { Layers } from '.';
import { PageLayer } from './types';

// Names are encoded as, e.g. "id1/id2/id3_stringValue"
export function decodeName(overrideName: string) {
  const [layerIdPathString, propertyType] = overrideName.split('_') as [
    string,
    PropertyType,
  ];

  return { layerIdPath: layerIdPathString.split('/'), propertyType };
}

export function encodeName(layerIdPath: string[], propertyType: PropertyType) {
  return [layerIdPath.join('/'), propertyType].join('_');
}

export type PropertyType =
  | 'stringValue'
  | 'symbolID'
  | 'image'
  | 'textStyle'
  | 'layerStyle';

export function getProperty(
  propertyType: PropertyType,
  value: Sketch.OverrideValue['value'],
) {
  switch (propertyType) {
    case 'stringValue':
    case 'symbolID':
    case 'layerStyle':
    case 'textStyle':
      return { type: propertyType, value: value as string };
    case 'image':
      return {
        type: propertyType,
        value: value as Sketch.FileRef | Sketch.DataRef,
      };
  }
}

export type Property = ReturnType<typeof getProperty>;

export function getLayerOverride(
  layer: PageLayer,
  propertyType: PropertyType,
  value: Sketch.OverrideValue['value'],
) {
  const property = getProperty(propertyType, value);

  switch (property.type) {
    case 'stringValue':
      if (!Layers.isTextLayer(layer)) return;

      return { type: property.type, value: property.value, layer } as const;
    case 'symbolID':
      if (!Layers.isSymbolInstance(layer)) return;

      return { type: property.type, value: property.value, layer } as const;
    case 'image':
      if (!Layers.isBitmapLayer(layer)) return;

      return { type: property.type, value: property.value, layer } as const;
    case 'textStyle': {
      if (!Layers.isTextLayer(layer)) return;

      return { type: property.type, value: property.value, layer } as const;
    }
    case 'layerStyle': {
      return { type: property.type, value: property.value, layer } as const;
    }
  }
}
