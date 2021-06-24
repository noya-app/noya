import Sketch from '@sketch-hq/sketch-file-format-ts';
import { FileMap } from 'noya-sketch-file';

export const imgFileExtensions = ['png', 'jpeg', 'webp'];
export const mimeTypes = imgFileExtensions.map(
  (e) => `image/${e === 'ico' ? 'x-icon' : e}`,
);

export type SketchPattern = {
  _class: 'pattern';
  image?: Sketch.FileRef | Sketch.DataRef;
  patternFillType: Sketch.PatternFillType;
  patternTileScale: number;
};

function encodeImg(input: Uint8Array) {
  //Source https://stackoverflow.com/questions/11089732/display-image-from-blob-using-javascript-and-websockets
  const keyStr =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let i = 0;

  while (i < input.length) {
    const chr1 = input[i++];
    const chr2 = i < input.length ? input[i++] : Number.NaN;
    const chr3 = i < input.length ? input[i++] : Number.NaN;

    const enc: Array<number> = [];
    enc[0] = chr1 >> 2;
    enc[1] = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc[2] = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc[3] = chr3 & 63;

    if (isNaN(chr2)) {
      enc[2] = enc[3] = 64;
    } else if (isNaN(chr3)) {
      enc[2] = 64;
    }

    output += enc.map((e) => keyStr.charAt(e)).join('');
  }
  return output;
}

export function getPatternBackground(
  images: FileMap,
  image?: Sketch.FileRef | Sketch.DataRef,
) {
  if (!image || !images[image._ref])
    return `url(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYAQMAAADaua+7AAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABNJREFUCNdjYOD/TxL+/4GBFAwAvMsj3bQ3H74AAAAASUVORK5CYI=A',
      )`;

  const bytes = new Uint8Array(images[image._ref]);
  return `url('data:image/png;base64,${encodeImg(bytes)}')`;
}

export function getPatternSize(
  fillType: Sketch.PatternFillType,
  tileScale: number,
) {
  return fillType === Sketch.PatternFillType.Fit
    ? 'contain'
    : fillType === Sketch.PatternFillType.Tile
    ? `${tileScale * 100}%`
    : fillType === Sketch.PatternFillType.Fill
    ? 'cover'
    : '100% 100%';
}
