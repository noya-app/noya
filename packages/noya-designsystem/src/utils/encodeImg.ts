export function encodeImg(input: Uint8Array) {
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
