import { invert } from '.';
import { isEqualArray } from './internal/isEqual';

const FILE_TYPE_TO_EXTENSION = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
} as const;

const FILE_EXTENSION_TO_TYPE = invert(FILE_TYPE_TO_EXTENSION);

export type FileType = keyof typeof FILE_TYPE_TO_EXTENSION;
export type FileExtension = typeof FILE_TYPE_TO_EXTENSION[FileType];

export function getFileExtensionForType(type: FileType) {
  return FILE_TYPE_TO_EXTENSION[type];
}

export function getFileTypeForExtension(type: FileExtension) {
  return FILE_EXTENSION_TO_TYPE[type];
}

function startsWith(
  arrayBuffer: ArrayBuffer,
  prefix: number[],
  offset: number = 0,
) {
  return isEqualArray(
    [...new Uint8Array(arrayBuffer).slice(offset, offset + prefix.length)],
    prefix,
    false,
  );
}

function isPNG(arrayBuffer: ArrayBuffer) {
  return startsWith(arrayBuffer, [
    0x89,
    0x50,
    0x4e,
    0x47,
    0x0d,
    0x0a,
    0x1a,
    0x0a,
  ]);
}

function isJPG(arrayBuffer: ArrayBuffer) {
  return startsWith(arrayBuffer, [0xff, 0xd8, 0xff]);
}

function isWEBP(arrayBuffer: ArrayBuffer) {
  return startsWith(arrayBuffer, [87, 69, 66, 80], 8);
}

function isPDF(arrayBuffer: ArrayBuffer) {
  return startsWith(arrayBuffer, [37, 80, 68, 70]);
}

export function detectFileType(
  arrayBuffer: ArrayBuffer,
): keyof typeof FILE_TYPE_TO_EXTENSION | undefined {
  if (isPNG(arrayBuffer)) {
    return 'image/png';
  } else if (isJPG(arrayBuffer)) {
    return 'image/jpeg';
  } else if (isWEBP(arrayBuffer)) {
    return 'image/webp';
  } else if (isPDF(arrayBuffer)) {
    return 'application/pdf';
  }
}
