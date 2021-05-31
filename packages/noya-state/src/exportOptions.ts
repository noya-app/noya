import Sketch from '@sketch-hq/sketch-file-format-ts';

type ExportScale = {
  scale: number;
  absoluteSize: number;
  visibleScaleType: Sketch.VisibleScaleType;
};

export function parseScale(
  scaleText: string,
  rect: Sketch.Rect,
): ExportScale | undefined {
  const scaleValue = isNaN(parseFloat(scaleText))
    ? parseFloat(scaleText.slice(0, -1))
    : parseFloat(scaleText);

  if (isNaN(scaleValue)) return undefined;

  const visibleScaleType =
    scaleText.slice(-1) === 'w'
      ? Sketch.VisibleScaleType.Width
      : scaleText.slice(-1) === 'h'
      ? Sketch.VisibleScaleType.Height
      : Sketch.VisibleScaleType.Scale;

  const absoluteSize =
    visibleScaleType === Sketch.VisibleScaleType.Scale ? 0 : scaleValue;

  const scale =
    visibleScaleType === Sketch.VisibleScaleType.Scale
      ? scaleValue
      : absoluteSize /
        (visibleScaleType === Sketch.VisibleScaleType.Width
          ? rect.width
          : rect.height);

  return { scale, absoluteSize, visibleScaleType };
}
