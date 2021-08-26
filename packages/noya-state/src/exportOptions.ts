import Sketch from 'noya-file-format';

export type ExportScale = {
  scale: number;
  absoluteSize: number;
  visibleScaleType: Sketch.VisibleScaleType;
};

export type ExportSize = {
  size: number;
  visibleScaleType: Sketch.VisibleScaleType;
};

function parseFloatWithSuffix(value: string): number | undefined {
  let parsed = parseFloat(value);

  if (!isNaN(parsed)) return parsed;

  // Remove the single-character suffix
  parsed = parseFloat(value.slice(0, -1));

  return isNaN(parsed) ? undefined : parsed;
}

export function parseScale(scaleText: string): ExportSize | undefined {
  const size = parseFloatWithSuffix(scaleText);

  if (size === undefined || size <= 0) return undefined;

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
