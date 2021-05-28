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

type PropertyValue = Sketch.OverrideValue['value'];
type ImagePropertyValue = Sketch.FileRef | Sketch.DataRef;

export type PropertyTypeMap = {
  stringValue: string;
  symbolID: string;
  textStyle: string;
  layerStyle: string;
  image: ImagePropertyValue;
};

export type PropertyType = keyof PropertyTypeMap;

export function isValidProperty<T extends PropertyType>(
  propertyType: T,
  value: PropertyValue,
): value is PropertyTypeMap[T] {
  switch (propertyType) {
    case 'stringValue':
    case 'symbolID':
    case 'layerStyle':
    case 'textStyle': {
      return typeof value === 'string';
    }
    case 'image': {
      return typeof value !== 'string';
    }
    default:
      // This should never happen
      return false;
  }
}

export function getLayerOverride(
  layer: PageLayer,
  propertyType: PropertyType,
  value: PropertyValue,
) {
  switch (propertyType) {
    case 'stringValue': {
      if (!Layers.isTextLayer(layer) || !isValidProperty(propertyType, value))
        return;

      return { type: propertyType, value, layer } as const;
    }
    case 'symbolID': {
      if (
        !Layers.isSymbolInstance(layer) ||
        !isValidProperty(propertyType, value)
      )
        return;

      return { type: propertyType, value, layer } as const;
    }
    case 'image': {
      if (!Layers.isBitmapLayer(layer) || !isValidProperty(propertyType, value))
        return;

      return { type: propertyType, value, layer } as const;
    }
    case 'textStyle': {
      if (!Layers.isTextLayer(layer) || !isValidProperty(propertyType, value))
        return;

      return { type: propertyType, value, layer } as const;
    }
    case 'layerStyle': {
      if (!isValidProperty(propertyType, value)) return;

      return { type: propertyType, value, layer } as const;
    }
  }
}

export function canOverrideProperty(
  overrideProperties: Sketch.OverrideProperty[],
  propertyType: PropertyType,
  key: string,
) {
  return (
    overrideProperties.find(({ overrideName }) => {
      const [idPathString, type] = overrideName.split('_');
      return idPathString === key && type === propertyType;
    })?.canOverride ?? true
  );
}

export function getOverrideValue<T extends PropertyType>(
  overrideValues: Sketch.OverrideValue[],
  propertyType: T,
  key: string,
) {
  const value = overrideValues.find(({ overrideName }) => {
    const [idPathString, type] = overrideName.split('_');
    return idPathString === key && type === propertyType;
  })?.value;

  return value !== undefined && isValidProperty(propertyType, value)
    ? value
    : undefined;
}
