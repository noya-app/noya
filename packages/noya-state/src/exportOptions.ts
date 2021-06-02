import Sketch from '@sketch-hq/sketch-file-format-ts';

export type ExportScale = {
  scale: number;
  absoluteSize: number;
  visibleScaleType: Sketch.VisibleScaleType;
};

export type ExportSize = {
  size: number;
  visibleScaleType: Sketch.VisibleScaleType;
};

export function parseScale(scaleText: string): ExportSize | undefined {
  const size = isNaN(parseFloat(scaleText))
    ? parseFloat(scaleText.slice(0, -1))
    : parseFloat(scaleText);

  if (isNaN(size) && size > 0) return undefined;

  const visibleScaleType =
    scaleText[scaleText.length - 1] === 'w'
      ? Sketch.VisibleScaleType.Width
      : scaleText[scaleText.length - 1] === 'h'
      ? Sketch.VisibleScaleType.Height
      : Sketch.VisibleScaleType.Scale;

  return { size, visibleScaleType };
}

export function getScaleUnits(visibleScaleType: Sketch.VisibleScaleType) {
  switch (visibleScaleType) {
    case Sketch.VisibleScaleType.Scale:
      return 'x';
    case Sketch.VisibleScaleType.Height:
      return 'h';
    case Sketch.VisibleScaleType.Width:
      return 'w';
  }
}
