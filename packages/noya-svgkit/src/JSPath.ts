/* eslint-disable @typescript-eslint/no-use-before-define */
import type {
  AngleInDegrees,
  AngleInRadians,
  FillType,
  InputFlattenedPointArray,
  InputRect,
  InputRRect,
  Path,
  PathCommand,
  PathOp,
  Point,
  Rect,
  StrokeOpts,
  VerbList,
  WeightList,
} from 'canvaskit';
import { JSEmbindObject } from './Embind';
import { SVGKit } from './SVGKit';

const shared2DContext = document.createElement('canvas').getContext('2d')!;

export function createJSPath(PathKit: any) {
  class JSPath extends JSEmbindObject implements Path {
    _path = new PathKit.NewPath();

    addArc(
      oval: InputRect,
      startAngle: AngleInDegrees,
      sweepAngle: AngleInDegrees,
    ): Path {
      throw new Error('Not implemented');
    }
    addOval(oval: InputRect, isCCW?: boolean, startIndex?: number): Path {
      throw new Error('Not implemented');
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
    ): Path {
      throw new Error('Not implemented');
    }
    close(): Path {
      return this._path.close();
    }
    computeTightBounds(outputArray?: Rect): Rect {
      const { fBottom, fLeft, fRight, fTop } = this._path.computeTightBounds();

      return SVGKit.LTRBRect(fLeft, fTop, fRight, fBottom);
    }
    conicTo(x1: number, y1: number, x2: number, y2: number, w: number): Path {
      throw new Error('Not implemented');
    }
    contains(x: number, y: number): boolean {
      return shared2DContext.isPointInPath(
        this._path.toPath2D(),
        x,
        y,
        this._path.getFillTypeString(),
      );
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
    toCmds(): PathCommand[] {
      return this._path.toCmds();
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

    static MakeFromCmds(cmds: PathCommand[]): JSPath | null {
      const path = new JSPath();
      path._path = PathKit.FromCmds(cmds);
      return path;
    }
  }

  return JSPath;
}
