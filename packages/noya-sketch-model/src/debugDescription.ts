import Sketch from '@sketch-hq/sketch-file-format-ts';
import { round } from 'noya-utils';
import { diagram } from 'tree-visit';
import { PointString } from './PointString';

export function describeValue(value: unknown): string {
  switch (typeof value) {
    case 'boolean':
    case 'bigint':
    case 'undefined':
      return `${value}`;
    case 'symbol':
      return String(value);
    case 'number':
      return round(value, 2).toString();
    case 'string':
      return JSON.stringify(value);
    case 'function':
      return '𝑓';
    case 'object':
      if (value === null) return `${value}`;

      if (Array.isArray(value)) {
        return `[ ${value.map(describeValue).join(', ')} ]`;
      }

      const entries = Object.entries(value).map(
        ([key, value]) => `${key}: ${describeValue(value)}`,
      );

      return `{ ${entries.join(', ')} }`;
  }
}

const upperFirst = (string: string) =>
  string.slice(0, 1).toUpperCase() + string.slice(1);

export function describeObject(
  object: Sketch.AnyObject,
  options: DescribeOptions | undefined,
): string {
  const className = `<${upperFirst(object._class)}>`;

  switch (object._class) {
    case Sketch.ClassValue.SymbolMaster:
    case Sketch.ClassValue.Group:
    case Sketch.ClassValue.Oval:
    case Sketch.ClassValue.Polygon:
    case Sketch.ClassValue.Rectangle:
    case Sketch.ClassValue.ShapePath:
    case Sketch.ClassValue.Star:
    case Sketch.ClassValue.Triangle:
    case Sketch.ClassValue.ShapeGroup:
    case Sketch.ClassValue.Text:
    case Sketch.ClassValue.SymbolInstance:
    case Sketch.ClassValue.Slice:
    case Sketch.ClassValue.Bitmap:
    case Sketch.ClassValue.Page:
    case Sketch.ClassValue.Artboard: {
      return [
        className,
        object.name,
        ...(options?.frames !== false
          ? [describeObject(object.frame, options)]
          : []),
        ...(options?.flip &&
        (object.isFlippedHorizontal || object.isFlippedVertical)
          ? [
              `flip(${object.isFlippedHorizontal ? 'h' : ''}${
                object.isFlippedVertical ? 'v' : ''
              })`,
            ]
          : []),
      ].join(' ');
    }
    case Sketch.ClassValue.CurvePoint: {
      const point = PointString.decode(object.point);
      const mode = Sketch.CurveMode[object.curveMode];
      return `${className} ${describeValue(point)} (${mode})`;
    }
    case Sketch.ClassValue.Fill:
    case Sketch.ClassValue.Border: {
      const typeString = Sketch.FillType[object.fillType];
      return `${className} (${typeString})`;
    }
    case Sketch.ClassValue.Color:
      const { _class, ...rest } = object;
      return `${className} ${describeValue(rest)}`;
    case Sketch.ClassValue.Rect:
      const { x, y, width, height } = object;
      const rect = { x, y, w: width, h: height };
      return describeValue(rect);
    case Sketch.ClassValue.AttributedString:
      return `${className} ${describeValue(object.string)}`;
    case Sketch.ClassValue.StringAttribute:
      const { length, location } = object;
      return `${className} ${describeValue({ location, length })}`;
    default:
      return className;
  }
}

type DescribeOptions = {
  style?: boolean;
  fills?: boolean;
  borders?: boolean;
  points?: boolean;
  frames?: boolean;
  flip?: boolean;
};

export function debugDescription(
  object: Sketch.AnyObject | Sketch.AnyObject[],
  options?: DescribeOptions,
): string {
  if (Array.isArray(object)) {
    return object.map((item) => debugDescription(item, options)).join('\n\n');
  }

  return diagram(object, {
    flattenSingleChildNodes: false,
    getLabel: (object) => describeObject(object, options),
    getChildren: (object) => {
      switch (object._class) {
        case Sketch.ClassValue.AttributedString:
          return object.attributes;
        case Sketch.ClassValue.SymbolMaster:
        case Sketch.ClassValue.Group:
        case Sketch.ClassValue.Oval:
        case Sketch.ClassValue.Polygon:
        case Sketch.ClassValue.Rectangle:
        case Sketch.ClassValue.ShapePath:
        case Sketch.ClassValue.Star:
        case Sketch.ClassValue.Triangle:
        case Sketch.ClassValue.ShapeGroup:
        case Sketch.ClassValue.Text:
        case Sketch.ClassValue.SymbolInstance:
        case Sketch.ClassValue.Slice:
        case Sketch.ClassValue.Bitmap:
        case Sketch.ClassValue.Page:
        case Sketch.ClassValue.Artboard: {
          return [
            ...(options?.style && object.style ? [object.style] : []),
            ...('layers' in object ? object.layers : []),
            ...(options?.points && 'points' in object ? object.points : []),
          ];
        }
        case Sketch.ClassValue.Border:
        case Sketch.ClassValue.Fill: {
          return [
            ...(object.fillType === Sketch.FillType.Color
              ? [object.color]
              : []),
          ];
        }
        case Sketch.ClassValue.Style: {
          return [
            ...(options?.fills && object.fills ? object.fills : []),
            ...(options?.borders && object.borders ? object.borders : []),
          ];
        }
        default: {
          return [];
        }
      }
    },
  });
}
