import type {
  AngleInDegrees,
  AngleInRadians,
  FillType,
  InputFlattenedPointArray,
  InputRect,
  InputRRect,
  Path,
  PathOp,
  Point,
  Rect,
  StrokeOpts,
  VerbList,
  WeightList,
} from 'canvaskit';
import {
  createRectFromBounds,
  getRectCornerPoints,
  getRectEdgeMidPoints,
} from 'noya-geometry';
import { parsePathCmds } from 'noya-state';
import { JSEmbindObject } from './Embind';
import { SVGKit } from './SVGKit';

const ROOT_2_OVER_2 = Math.sqrt(2) / 2;

export function createJSPath(PathKit: any) {
  class JSPath extends JSEmbindObject implements Path {
    private _path = new PathKit.NewPath();

    makeAsWinding(): Path | null {
      throw new Error('Not implemented');
    }
    addArc(
      oval: InputRect,
      startAngle: AngleInDegrees,
      sweepAngle: AngleInDegrees,
    ): Path {
      throw new Error('Not implemented');
    }
    addOval(oval: InputRect, isCCW?: boolean, startIndex?: number): JSPath {
      const [minX, minY, maxX, maxY] = oval as Float32Array | number[];
      const rect = createRectFromBounds({ minX, minY, maxX, maxY });

      const rectPoints = getRectCornerPoints(rect);
      const ovalPoints = getRectEdgeMidPoints(rect);

      this.moveTo(
        ovalPoints[ovalPoints.length - 1].x,
        ovalPoints[ovalPoints.length - 1].y,
      );

      for (let i = 0; i < ovalPoints.length; i++) {
        this.conicTo(
          rectPoints[i].x,
          rectPoints[i].y,
          ovalPoints[i].x,
          ovalPoints[i].y,
          ROOT_2_OVER_2,
        );
      }

      this.close();

      return this;
    }
    addPath(...args: any[]): Path | null {
      throw new Error('Not implemented');
    }
    addPoly(points: InputFlattenedPointArray, close: boolean): Path {
      throw new Error('Not implemented');
    }
    addRect(rect: InputRect, isCCW?: boolean): Path {
      throw new Error('Not implemented');
    }
    addRRect(rrect: InputRRect, isCCW?: boolean): Path {
      throw new Error('Not implemented');
    }
    addVerbsPointsWeights(
      verbs: VerbList,
      points: InputFlattenedPointArray,
      weights?: WeightList,
    ): Path {
      throw new Error('Not implemented');
    }
    arc(
      x: number,
      y: number,
      radius: number,
      startAngle: AngleInRadians,
      endAngle: AngleInRadians,
      isCCW?: boolean,
    ): Path {
      throw new Error('Not implemented');
    }
    arcToOval(
      oval: InputRect,
      startAngle: AngleInDegrees,
      endAngle: AngleInDegrees,
      forceMoveTo: boolean,
    ): Path {
      throw new Error('Not implemented');
    }
    arcToRotated(
      rx: number,
      ry: number,
      xAxisRotate: AngleInDegrees,
      useSmallArc: boolean,
      isCCW: boolean,
      x: number,
      y: number,
    ): Path {
      throw new Error('Not implemented');
    }
    arcToTangent(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      radius: number,
    ): JSPath {
      this._path.arcTo(x1, y1, x2, y2, radius);
      return this;
    }
    close(): Path {
      return this._path.close();
    }
    computeTightBounds(outputArray?: Rect): Rect {
      const { fBottom, fLeft, fRight, fTop } = this._path.computeTightBounds();

      return SVGKit.LTRBRect(fLeft, fTop, fRight, fBottom);
    }
    conicTo(x1: number, y1: number, x2: number, y2: number, w: number): Path {
      return this._path.conicTo(x1, y1, x2, y2, w);
    }
    contains(x: number, y: number): boolean {
      return this._path.contains(x, y);
    }
    copy(): JSPath {
      return JSPath.MakeFromCmds(this.toCmds())!;
    }
    countPoints(): number {
      throw new Error('Not implemented');
    }
    cubicTo(
      cpx1: number,
      cpy1: number,
      cpx2: number,
      cpy2: number,
      x: number,
      y: number,
    ): Path {
      return this._path.cubicTo(cpx1, cpy1, cpx2, cpy2, x, y);
    }
    dash(on: number, off: number, phase: number): boolean {
      throw new Error('Not implemented');
    }
    equals(other: Path): boolean {
      throw new Error('Not implemented');
    }
    getBounds(outputArray?: Rect): Rect {
      throw new Error('Not implemented');
    }
    getFillType(): FillType {
      return this._path.getFillType() === PathKit.FillType.WINDING
        ? SVGKit.FillType.Winding
        : SVGKit.FillType.EvenOdd;
    }
    getPoint(index: number, outputArray?: Point): Point {
      throw new Error('Not implemented');
    }
    isEmpty(): boolean {
      throw new Error('Not implemented');
    }
    isVolatile(): boolean {
      throw new Error('Not implemented');
    }
    lineTo(x: number, y: number): Path {
      return this._path.lineTo(x, y);
    }
    moveTo(x: number, y: number): Path {
      return this._path.moveTo(x, y);
    }
    offset(dx: number, dy: number): Path {
      throw new Error('Not implemented');
    }
    op(other: JSPath, op: PathOp): boolean {
      return this._path.op(
        other._path,
        op === SVGKit.PathOp.Difference
          ? PathKit.PathOp.DIFFERENCE
          : PathKit.PathOp.INTERSECT,
      );
    }
    quadTo(x1: number, y1: number, x2: number, y2: number): Path {
      return this._path.quadTo(x1, y1, x2, y2);
    }
    rArcTo(
      rx: number,
      ry: number,
      xAxisRotate: AngleInDegrees,
      useSmallArc: boolean,
      isCCW: boolean,
      dx: number,
      dy: number,
    ): Path {
      throw new Error('Not implemented');
    }
    rConicTo(
      dx1: number,
      dy1: number,
      dx2: number,
      dy2: number,
      w: number,
    ): Path {
      throw new Error('Not implemented');
    }
    rCubicTo(
      cpx1: number,
      cpy1: number,
      cpx2: number,
      cpy2: number,
      x: number,
      y: number,
    ): Path {
      throw new Error('Not implemented');
    }
    reset(): void {
      throw new Error('Not implemented');
    }
    rewind(): void {
      throw new Error('Not implemented');
    }
    rLineTo(x: number, y: number): Path {
      throw new Error('Not implemented');
    }
    rMoveTo(x: number, y: number): Path {
      throw new Error('Not implemented');
    }
    rQuadTo(x1: number, y1: number, x2: number, y2: number): Path {
      throw new Error('Not implemented');
    }
    setFillType(fill: FillType): void {
      this._path.setFillType(
        fill === SVGKit.FillType.Winding
          ? PathKit.FillType.WINDING
          : PathKit.FillType.EVENODD,
      );
    }
    setIsVolatile(volatile: boolean): void {
      throw new Error('Not implemented');
    }
    simplify(): boolean {
      throw new Error('Not implemented');
    }
    stroke(opts?: StrokeOpts): Path | null {
      this._path = this._path.stroke(opts);
      return this;
    }
    toCmds(): Float32Array {
      return new Float32Array(this._path.toCmds().flat());
    }
    toSVGString(): string {
      return this._path.toSVGString();
    }
    transform(...args: any[]): Path {
      throw new Error('Not implemented');
    }
    trim(startT: number, stopT: number, isComplement: boolean): Path | null {
      throw new Error('Not implemented');
    }

    static MakeFromCmds(cmds: Float32Array): JSPath | null {
      const path = new JSPath();
      path._path = PathKit.FromCmds(parsePathCmds(cmds));
      return path;
    }
  }

  return JSPath;
}
