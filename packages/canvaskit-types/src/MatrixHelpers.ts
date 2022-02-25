export interface IMatrixHelpers<IMatrix> {
  identity(): IMatrix;
  multiply(...matrices: IMatrix[]): IMatrix;
  rotated(radians: number, px?: number, py?: number): IMatrix;
  scaled(sx: number, sy: number, px?: number, py?: number): IMatrix;
  skewed(kx: number, ky: number, px?: number, py?: number): IMatrix;
  translated(dx: number, dy: number): IMatrix;
}

export interface IColorMatrixHelpers<IColorMatrix> {
  concat(outer: IColorMatrix, inner: IColorMatrix): IColorMatrix;
  identity(): IColorMatrix;
  postTranslate(
    m: IColorMatrix,
    dr: number,
    dg: number,
    db: number,
    da: number,
  ): IColorMatrix;
  rotated(axis: number, sine: number, cosine: number): IColorMatrix;
  scaled(
    redScale: number,
    greenScale: number,
    blueScale: number,
    alphaScale: number,
  ): IColorMatrix;
}
