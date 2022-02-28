export interface IMatrixHelpers<IMatrix> {
  identity(): IMatrix;
  multiply(...matrices: IMatrix[]): IMatrix;
  rotated(radians: number, px?: number, py?: number): IMatrix;
  scaled(sx: number, sy: number, px?: number, py?: number): IMatrix;
  skewed(kx: number, ky: number, px?: number, py?: number): IMatrix;
  translated(dx: number, dy: number): IMatrix;
}

export interface IColorMatrixHelpers<IMatrix> {
  concat(outer: IMatrix, inner: IMatrix): IMatrix;
  identity(): IMatrix;
  postTranslate(
    m: IMatrix,
    dr: number,
    dg: number,
    db: number,
    da: number,
  ): IMatrix;
  rotated(axis: number, sine: number, cosine: number): IMatrix;
  scaled(
    redScale: number,
    greenScale: number,
    blueScale: number,
    alphaScale: number,
  ): IMatrix;
}
