import { SkiaPath } from './Path';
import { SkiaPaint } from './Paint';
import { SkiaPathEffect } from './PathEffect';
import { SkiaImageFilterFactory } from './ImageFilter';
import { SkiaParagraphBuilder } from './ParagraphBuilder';
import { SkiaTypefaceFontProviderFactory } from './TypefaceFontProvider';

export const Wrappers = {
  Path: SkiaPath,
  Paint: SkiaPaint,
  PathEffect: SkiaPathEffect,
  ImageFilter: SkiaImageFilterFactory,
  ParagraphBuilder: SkiaParagraphBuilder,
  TypefaceFontProvider: SkiaTypefaceFontProviderFactory,
};

export { Embind } from './Embind';
