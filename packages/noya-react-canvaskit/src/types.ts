import {
  ClipOp,
  Image,
  Matrix3x3,
  Paint,
  Paragraph,
  Path,
  Rect,
  Surface,
  ColorFilter,
} from 'canvaskit-wasm';
import { ReactNode } from 'react';
import { ReactCanvasKitContext } from './contexts/ReactCanvasKitContext';

export interface RectComponentProps {
  rect: Rect;
  paint: Paint;
}

interface RectComponent {
  type: 'Rect';
  props: RectComponentProps;
}

export interface ImageComponentProps {
  rect: Rect;
  image: Image;
  paint: Paint;
}

interface ImageComponent {
  type: 'Image';
  props: ImageComponentProps;
}

export interface PathComponentProps {
  path: Path;
  paint: Paint;
}

interface PathComponent {
  type: 'Path';
  props: PathComponentProps;
}

export interface TextComponentProps {
  rect: Rect;
  paragraph: Paragraph;
}

interface TextComponent {
  type: 'Text';
  props: TextComponentProps;
}

export interface ClipProps {
  path: Float32Array | Path;
  op: ClipOp;
  antiAlias?: boolean;
}

export interface GroupComponentProps {
  transform?: Matrix3x3;
  opacity: number;
  children: ReactNode;
  clip?: ClipProps;
  colorFilter?: ColorFilter;
}

interface GroupComponent {
  type: 'Group';
  props: GroupComponentProps;
  _elements: AnyElementInstance[];
}

export interface ElementTypeMap {
  Rect: RectComponent;
  Text: TextComponent;
  Path: PathComponent;
  Image: ImageComponent;
  Group: GroupComponent;
}

export type ElementType = keyof ElementTypeMap;
export type ElementInstance<K extends ElementType> = ElementTypeMap[K];
export type ElementProps<K extends ElementType> = ElementInstance<K>['props'];

export type AnyElementInstance = ElementInstance<ElementType>;
export type AnyElementProps = ElementProps<ElementType>;

export interface RootComponent {
  context: ReactCanvasKitContext;
  surface: Surface;
  children: ElementInstance<ElementType>[];
}
