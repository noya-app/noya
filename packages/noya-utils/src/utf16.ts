function toUTF8(string: string) {
  const encoder = new TextEncoder();
  return encoder.encode(string);
}

export const UTF16 = {
  toUTF8,
};
