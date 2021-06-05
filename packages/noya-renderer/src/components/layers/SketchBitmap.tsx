import Sketch from '@sketch-hq/sketch-file-format-ts';
import { useApplicationState } from 'app/src/contexts/ApplicationStateContext';
import { CanvasKit } from 'canvaskit';
import { getRectCornerPoints, toDegrees, toRadians } from 'noya-geometry';
import {
  Group,
  Image,
  makePath,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import { Primitives } from 'noya-renderer';
import { memo, useMemo } from 'react';
import SketchBorder from '../effects/SketchBorder';

function multiplyColorMatrix(
  CanvasKit: CanvasKit,
  [first, ...rest]: Float32Array[],
) {
  if (!first) return CanvasKit.ColorMatrix.identity();

  return rest.reduce(
    (result, item) => CanvasKit.ColorMatrix.concat(result, item),
    first,
  );
}

interface Props {
  layer: Sketch.Bitmap;
}

export default memo(function SketchBitmap({ layer }: Props) {
  const [state] = useApplicationState();
  const { CanvasKit } = useReactCanvasKit();

  const ref = state.sketch.images[layer.image._ref];
  const paint = useMemo(() => new CanvasKit.Paint(), [CanvasKit]);

  const path = makePath(CanvasKit, getRectCornerPoints(layer.frame));

  path.setFillType(CanvasKit.FillType.EvenOdd);

  if (!layer.style) return null;

  const borders = (layer.style.borders ?? []).filter((x) => x.isEnabled);
  const shadows = (layer.style.shadows ?? []).filter((x) => x.isEnabled);

  const imageElement = (
    <Image
      rect={Primitives.rect(CanvasKit, layer.frame)}
      image={ref}
      paint={paint}
    />
  );

  const { hue, saturation, brightness, contrast } = layer.style.colorControls;
  const colorFilter = layer.style.colorControls.isEnabled
    ? CanvasKit.ColorFilter.MakeMatrix(
        multiplyColorMatrix(CanvasKit, [
          getHueRotationMatrix(toDegrees(hue)),
          getSaturationMatrix(saturation),
          getBrightnessMatrix(brightness),
          getContrastMatrix(contrast - 1),
        ]),
      )
    : undefined;

  const element = (
    <>
      {shadows.map((shadow, index) => {
        const imageFilter = CanvasKit.ImageFilter.MakeDropShadowOnly(
          shadow.offsetX,
          shadow.offsetY,
          shadow.blurRadius / 2,
          shadow.blurRadius / 2,
          Primitives.color(CanvasKit, shadow.color),
          null,
        );

        return (
          <Group key={`shadow-${index}`} imageFilter={imageFilter}>
            {imageElement}
          </Group>
        );
      })}
      <Group colorFilter={colorFilter}>{imageElement}</Group>
      {borders.map((border, index) => (
        <SketchBorder key={`border-${index}`} path={path} border={border} />
      ))}
    </>
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;
  const needsGroup = opacity < 1 || shadows.length > 0;

  return needsGroup ? <Group opacity={opacity}>{element}</Group> : element;
});

// modules/svg/src/SkSVGFeColorMatrix.cpp
// https://www.w3.org/TR/filter-effects-1/#ShorthandEquivalents
// https://www.createjs.com/docs/easeljs/files/easeljs_filters_ColorMatrix.js.html#l41
function getHueRotationMatrix(degrees: number) {
  const theta = toRadians(degrees);
  const c = Math.cos(theta);
  const s = Math.sin(theta);

  return new Float32Array(
    [
      [
        0.213 + c * 0.787 + s * -0.213,
        0.715 + c * -0.715 + s * -0.715,
        0.072 + c * -0.072 + s * 0.928,
        0,
        0,
      ],
      [
        0.213 + c * -0.213 + s * 0.143,
        0.715 + c * 0.285 + s * 0.14,
        0.072 + c * -0.072 + s * -0.283,
        0,
        0,
      ],
      [
        0.213 + c * -0.213 + s * -0.787,
        0.715 + c * -0.715 + s * 0.715,
        0.072 + c * 0.928 + s * 0.072,
        0,
        0,
      ],
      [0, 0, 0, 1, 0],
    ].flat(),
  );
}

function getSaturationMatrix(sat: number) {
  const R = 0.213 * (1 - sat);
  const G = 0.715 * (1 - sat);
  const B = 0.072 * (1 - sat);

  return new Float32Array(
    [
      [R + sat, G, B, 0, 0],
      [R, G + sat, B, 0, 0],
      [R, G, B + sat, 0, 0],
      [0, 0, 0, 1, 0],
    ].flat(),
  );
}

function getBrightnessMatrix(value: number) {
  return new Float32Array(
    [
      [1, 0, 0, 0, value],
      [0, 1, 0, 0, value],
      [0, 0, 1, 0, value],
      [0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1],
    ].flat(),
  );
}

/**
 * Array of delta values for contrast calculations.
 * @property DELTA_INDEX
 * @type Array
 * @protected
 * @static
 **/
const DELTA_INDEX = [
  [0, 0.01, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1, 0.11],
  [0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.2, 0.21, 0.22, 0.24],
  [0.25, 0.27, 0.28, 0.3, 0.32, 0.34, 0.36, 0.38, 0.4, 0.42],
  [0.44, 0.46, 0.48, 0.5, 0.53, 0.56, 0.59, 0.62, 0.65, 0.68],
  [0.71, 0.74, 0.77, 0.8, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98],
  [1.0, 1.06, 1.12, 1.18, 1.24, 1.3, 1.36, 1.42, 1.48, 1.54],
  [1.6, 1.66, 1.72, 1.78, 1.84, 1.9, 1.96, 2.0, 2.12, 2.25],
  [2.37, 2.5, 2.62, 2.75, 2.87, 3.0, 3.2, 3.4, 3.6, 3.8],
  [4.0, 4.3, 4.7, 4.9, 5.0, 5.5, 6.0, 6.5, 6.8, 7.0],
  [7.3, 7.5, 7.8, 8.0, 8.4, 8.7, 9.0, 9.4, 9.6, 9.8],
  [10.0],
].flat();

function getContrastMatrix(value: number) {
  let x: number;

  if (value < 0) {
    x = 127 + (value / 100) * 127;
  } else {
    x = value % 1;
    if (x === 0) {
      x = DELTA_INDEX[value];
    } else {
      x = DELTA_INDEX[value << 0] * (1 - x) + DELTA_INDEX[(value << 0) + 1] * x; // use linear interpolation for more granularity.
    }
    x = x * 127 + 127;
  }

  return new Float32Array(
    [
      [x / 127, 0, 0, 0, 0.5 * (127 - x)],
      [0, x / 127, 0, 0, 0.5 * (127 - x)],
      [0, 0, x / 127, 0, 0.5 * (127 - x)],
      [0, 0, 0, 1, 0],
    ].flat(),
  );
}
