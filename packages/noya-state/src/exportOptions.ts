import Sketch from '@sketch-hq/sketch-file-format-ts';

export type ExportScale = {
  scale: number;
  absoluteSize: number;
  visibleScaleType: Sketch.VisibleScaleType;
};

export function parseScale(scaleText: string): ExportScale | undefined {
  const scaleValue = isNaN(parseFloat(scaleText))
    ? parseFloat(scaleText.slice(0, -1))
    : parseFloat(scaleText);

  if (isNaN(scaleValue) && scaleValue > 0) return undefined;

  const visibleScaleType =
    scaleText[scaleText.length - 1] === 'w'
      ? Sketch.VisibleScaleType.Width
      : scaleText[scaleText.length - 1] === 'h'
      ? Sketch.VisibleScaleType.Height
      : Sketch.VisibleScaleType.Scale;

  const absoluteSize =
    visibleScaleType === Sketch.VisibleScaleType.Scale ? 0 : scaleValue;

  const scale =
    visibleScaleType === Sketch.VisibleScaleType.Scale
      ? scaleValue
      : absoluteSize;

  return { scale, absoluteSize, visibleScaleType };
}

export function getScaleUnits(visibleScaleType: Sketch.VisibleScaleType) {
  return visibleScaleType !== Sketch.VisibleScaleType.Scale
    ? visibleScaleType === Sketch.VisibleScaleType.Height
      ? 'h'
      : 'w'
    : 'x';
}
