import {
  BlurStyle,
  ClipOp,
  Color,
  ColorFilter,
  ImageFilter,
  InputColor,
  MaskFilter,
  Paint,
  PaintStyle,
  Paragraph,
  Path,
  StrokeCap,
  StrokeJoin,
} from '@noya-app/noya-canvaskit';
import { AffineTransform, Point } from '@noya-app/noya-geometry';
import { ReactNode } from 'react';

export type RectParameters = Float32Array;

export type DropShadow = {
  type: 'dropShadow';
  offset: Point;
  radius: number;
  color: InputColor;
};

export type BlurMaskFilterParameters = {
  style: BlurStyle;
  sigma: number;
  respectCTM: boolean;
};

export interface ClipProps {
  path: Float32Array | Path;
  op: ClipOp;
  antiAlias?: boolean;
}

export type ColorParameters = Color | number[] | string;

export interface PaintParameters {
  color: ColorParameters;
  opacity?: number;
  style: PaintStyle;
  strokeWidth?: number;
  antiAlias?: boolean;
  maskFilter?: MaskFilter;
  strokeJoin?: StrokeJoin;
  strokeCap?: StrokeCap;
}

export interface GroupProps {
  opacity?: number;
  transform?: AffineTransform;
  children?: ReactNode;
  clip?: ClipProps;
  colorFilter?: ColorFilter;
  imageFilter?: ImageFilter | DropShadow;
  backdropImageFilter?: ImageFilter;
}

export interface ImageProps {
  image: ArrayBuffer;
  rect: RectParameters;
  paint: Paint | PaintParameters;
  resample?: boolean;
}

export interface PathProps {
  path: Path;
  paint: Paint;
}

export interface PolylineProps {
  points: Point[];
  paint: Paint;
}

export interface RectProps {
  rect: RectParameters;
  cornerRadius?: number;
  paint: Paint;
}

export interface TextProps {
  rect: RectParameters;
  paragraph: Paragraph;
}

export type IComponents = {
  Rect: React.FC<RectProps>;
  Path: React.FC<PathProps>;
  Group: React.FC<GroupProps>;
  Image: React.FC<ImageProps>;
  Text: React.FC<TextProps>;
  Polyline: React.FC<PolylineProps>;
};
