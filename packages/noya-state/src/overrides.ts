import type Sketch from 'noya-file-format';
import { Layers } from './layer';
import { PageLayer } from './layers';

// Names are encoded as, e.g. "id1/id2/id3_stringValue"
export function decodeName(overrideName: string) {
  const [layerIdPathString, propertyType] = overrideName.split('_') as [
    string,
    PropertyType,
  ];

  return { layerIdPath: layerIdPathString.split('/'), propertyType };
}

export function encodeName(layerIdPath: string[], propertyType: PropertyType) {
  return [layerIdPath.join('/'), propertyType].filter(Boolean).join('_');
}

type PropertyValue = Sketch.OverrideValue['value'];
type ImagePropertyValue = Sketch.FileRef | Sketch.DataRef;

export type PropertyTypeMap = {
  stringValue: string;
  symbolID: string;
  textStyle: string;
  layerStyle: string;
  image: ImagePropertyValue;
  blockText: string;
  blockParameters: string[];
  resolvedBlockData: Sketch.ResolvedBlockData;
  isVisible: boolean;
  layers: Sketch.AnyLayer[];
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
    case 'textStyle':
    case 'blockText': {
      return typeof value === 'string';
    }
    case 'image': {
      return typeof value !== 'string';
    }
    case 'blockParameters': {
      return Array.isArray(value);
    }
    case 'layers': {
      return Array.isArray(value);
    }
    case 'resolvedBlockData': {
      return true;
    }
    case 'isVisible': {
      return typeof value === 'boolean';
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
    case 'isVisible': {
      if (!isValidProperty(propertyType, value)) return;

      return { type: propertyType, value, layer } as const;
    }
    case 'resolvedBlockData':
      if (
        !Layers.isSymbolInstance(layer) ||
        !isValidProperty(propertyType, value)
      )
        return;

      return { type: propertyType, value, layer } as const;
    case 'layers':
      if (
        !Layers.isSymbolInstance(layer) ||
        !isValidProperty(propertyType, value)
      )
        return;

      return { type: propertyType, value, layer } as const;
    case 'blockText': {
      if (
        !Layers.isSymbolInstance(layer) ||
        !isValidProperty(propertyType, value)
      )
        return;

      return { type: propertyType, value, layer } as const;
    }
    case 'blockParameters': {
      if (
        !Layers.isSymbolInstance(layer) ||
        !isValidProperty(propertyType, value)
      )
        return;

      return { type: propertyType, value, layer } as const;
    }
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
  pathString: string,
  propertyType: T,
) {
  const value = overrideValues.find(({ overrideName }) => {
    const [idPathString, type] = overrideName.split('_');
    return idPathString === pathString && type === propertyType;
  })?.value;

  return value !== undefined && isValidProperty(propertyType, value)
    ? value
    : undefined;
}

export function removePrefix(
  overrideValues: Sketch.OverrideValue[],
  prefixLayerId: string,
) {
  const overrides = overrideValues.flatMap(
    (override): Sketch.OverrideValue[] => {
      const {
        layerIdPath: [layerId, ...remainingPath],
        propertyType,
      } = decodeName(override.overrideName);

      if (layerId !== prefixLayerId) return [];

      return [
        {
          ...override,
          overrideName: encodeName(remainingPath, propertyType),
        },
      ];
    },
  );

  return overrides;
}
