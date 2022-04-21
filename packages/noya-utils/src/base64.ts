import { decode as decodeBase64, encode as encodeBase64 } from 'base-64';

// A simple, unoptimized decoder for small images
function decode(base64: string): ArrayBufferLike {
  const binary_string = decodeBase64(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i += 1) {
    bytes[i] = binary_string.charCodeAt(i);
  }

  return bytes.buffer;
}

function encode(data: ArrayBufferLike): string {
  let binary = '';
  const bytes = new Uint8Array(data);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return encodeBase64(binary);
}

export const Base64 = {
  encode,
  decode,
};
