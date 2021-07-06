// A simple, unoptimized decoder for small images
function decode(string: string) {
  return new Uint8Array(
    atob(string)
      .split('')
      .map((char) => char.charCodeAt(0)),
  );
}

function encode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  let binary = '';
  const length = bytes.byteLength;

  for (let i = 0; i < length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
}

export const Base64 = {
  encode,
  decode,
};
