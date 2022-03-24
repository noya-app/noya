import { decode as decodeBase64, encode as encodeBase64 } from 'base-64';

export function base64ToArrayBuffer(base64: string) {
  var binary_string = decodeBase64(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);

  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export function arrayBufferToBase64(data: ArrayBufferLike) {
  var binary = '';
  var bytes = new Uint8Array(data);
  var len = bytes.byteLength;

  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return encodeBase64(binary);
}
