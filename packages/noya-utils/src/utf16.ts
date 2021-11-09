function toUTF8(string: string) {
  const encoder = new TextEncoder();
  return encoder.encode(string);
}

function fromUTF8(encoded: Uint8Array) {
  const decoder = new TextDecoder();
  return decoder.decode(encoded);
}

export const UTF16 = {
  toUTF8,
  fromUTF8,
};
