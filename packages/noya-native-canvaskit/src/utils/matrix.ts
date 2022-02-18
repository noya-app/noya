type MatrixType = Float32Array | number[];

export function multiply(a: MatrixType, b: MatrixType): MatrixType {
  const size = Math.sqrt(a.length);
  const result: number[] = new Array(a.length).fill(0);

  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < size; j += 1) {
      let aIdx = Math.floor(i / size) * size + j;
      let bIdx = j * size + (i % size);

      result[i] += a[aIdx] * b[bIdx];
    }
  }

  return a instanceof Float32Array ? new Float32Array(result) : result;
}
