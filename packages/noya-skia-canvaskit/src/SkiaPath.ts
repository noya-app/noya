import * as RNSkia from '@shopify/react-native-skia';

import type {
  // AngleInDegrees,
  // AngleInRadians,
  EmbindEnumEntity,
  FillType,
  InputFlattenedPointArray,
  InputRect,
  InputRRect,
  Path,
  // PathOp,
  // Point,
  // Rect,
  StrokeOpts,
  VerbList,
  WeightList,
} from 'canvaskit';
import // createRectFromBounds,
// getRectCornerPoints,
// getRectEdgeMidPoints,
'noya-geometry';
import { parsePathCmds } from 'noya-state';
import { JSEmbindObject } from './Embind';

// const ROOT_2_OVER_2 = Math.sqrt(2) / 2;

const LTRBArrayToIRect = (
  inRect: Float32Array | undefined,
): RNSkia.IRect | undefined => {
  if (!inRect) {
    return undefined;
  }

  const [left, top, right, bottom] = inRect;
  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

const IRectToLTRBArray = (inRect: RNSkia.IRect): Float32Array => {
  return new Float32Array([
    inRect.x,
    inRect.y,
    inRect.x + inRect.width,
    inRect.y + inRect.height,
  ]);
};

// TODO: do i really need pathkit?
export function createSkiaPath(PathKit?: any) {
  class SKiaPathWrapper extends JSEmbindObject implements Path {
    private _path = RNSkia.Skia.Path.Make();

    makeAsWinding(): Path | null {
      this._path.makeAsWinding();
      return this;
    }

    addArc(
      oval: InputRect,
      startAngle: number,
      sweepAngle: number,
    ): SKiaPathWrapper {
      this._path.addArc(
        LTRBArrayToIRect(oval as Float32Array)!,
        startAngle,
        sweepAngle,
      );

      return this;
    }

    addOval(
      oval: InputRect,
      isCCW?: boolean,
      startIndex?: number,
    ): SKiaPathWrapper {
      this._path.addOval(
        LTRBArrayToIRect(oval as Float32Array)!,
        isCCW,
        startIndex,
      );

      return this;
    }

    addPath(...args: any[]): SKiaPathWrapper {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    addPoly(points: InputFlattenedPointArray, close: boolean): SKiaPathWrapper {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    addRect(rect: InputRect, isCCW?: boolean): SKiaPathWrapper {
      this._path.addRect(LTRBArrayToIRect(rect as Float32Array)!, isCCW);

      return this;
    }

    addRRect(rrect: InputRRect, isCCW?: boolean): SKiaPathWrapper {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    addVerbsPointsWeights(
      verbs: VerbList,
      points: InputFlattenedPointArray,
      weights?: WeightList,
    ): Path {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    arc(
      x: number,
      y: number,
      radius: number,
      startAngle: number,
      endAngle: number,
      isCCW?: boolean,
    ): Path {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    arcToOval(
      oval: InputRect,
      startAngle: number,
      endAngle: number,
      forceMoveTo: boolean,
    ): Path {
      this._path.arcToOval(
        LTRBArrayToIRect(oval as Float32Array)!,
        startAngle,
        endAngle,
        forceMoveTo,
      );

      return this;
    }

    arcToRotated(
      rx: number,
      ry: number,
      xAxisRotate: number,
      useSmallArc: boolean,
      isCCW: boolean,
      x: number,
      y: number,
    ): Path {
      this._path.arcToRotated(rx, ry, xAxisRotate, useSmallArc, isCCW, x, y);

      return this;
    }

    arcToTangent(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      radius: number,
    ): Path {
      this._path.arcToTangent(x1, y1, x2, y2, radius);
      return this;
    }

    close(): Path {
      this._path.close();

      return this;
    }

    computeTightBounds(outputArray?: Float32Array): Float32Array {
      const a = IRectToLTRBArray(
        this._path.computeTightBounds(LTRBArrayToIRect(outputArray)),
      );

      return a;
    }

    conicTo(x1: number, y1: number, x2: number, y2: number, w: number): Path {
      this._path.conicTo(x1, y1, x2, y2, w);

      return this;
    }

    contains(x: number, y: number): boolean {
      return this._path.contains(x, y);
    }

    copy(): Path {
      const pathCopy = this._path.copy();

      const copy = new SKiaPathWrapper();
      copy._path = pathCopy;

      return copy;
    }

    countPoints(): number {
      return this._path.countPoints();
    }

    cubicTo(
      cpx1: number,
      cpy1: number,
      cpx2: number,
      cpy2: number,
      x: number,
      y: number,
    ): Path {
      this._path.cubicTo(cpx1, cpy1, cpx2, cpy2, x, y);

      return this;
    }

    dash(on: number, off: number, phase: number): boolean {
      return this._path.dash(on, off, phase);
    }

    equals(other: Path): boolean {
      return this._path.equals((other as SKiaPathWrapper)._path);
    }

    getBounds(outputArray?: Float32Array): Float32Array {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    getFillType(): EmbindEnumEntity {
      return { value: this._path.getFillType() };
    }

    getPoint(index: number, outputArray?: Float32Array): Float32Array {
      const point = this._path.getPoint(index);
      if (outputArray) {
        /// ?????
        outputArray[0] = point.x;
        outputArray[1] = point.y;

        return outputArray;
      }

      return new Float32Array([point.x, point.y]);
    }

    isEmpty(): boolean {
      return this._path.isEmpty();
    }

    isVolatile(): boolean {
      return this._path.isVolatile();
    }

    lineTo(x: number, y: number): Path {
      this._path.lineTo(x, y);
      return this;
    }

    moveTo(x: number, y: number): Path {
      this._path.moveTo(x, y);
      return this;
    }

    offset(dx: number, dy: number): Path {
      this._path.offset(dx, dy);
      return this;
    }

    op(other: SKiaPathWrapper, op: EmbindEnumEntity): boolean {
      return this._path.op(other._path, op.value as RNSkia.PathOp);
    }

    quadTo(x1: number, y1: number, x2: number, y2: number): Path {
      this._path.quadTo(x1, y1, x2, y2);

      return this;
    }

    rArcTo(
      rx: number,
      ry: number,
      xAxisRotate: number,
      useSmallArc: boolean,
      isCCW: boolean,
      dx: number,
      dy: number,
    ): Path {
      this._path.rArcTo(rx, ry, xAxisRotate, useSmallArc, isCCW, dx, dy);

      return this;
    }

    rConicTo(
      dx1: number,
      dy1: number,
      dx2: number,
      dy2: number,
      w: number,
    ): Path {
      this._path.rConicTo(dx1, dy1, dx2, dy2, w);

      return this;
    }

    rCubicTo(
      cpx1: number,
      cpy1: number,
      cpx2: number,
      cpy2: number,
      x: number,
      y: number,
    ): Path {
      this._path.rCubicTo(cpx1, cpy1, cpx2, cpy2, x, y);

      return this;
    }

    reset(): void {
      this._path.reset();
    }

    rewind(): void {
      this._path.rewind();
    }

    rLineTo(x: number, y: number): Path {
      this._path.rLineTo(x, y);

      return this;
    }

    rMoveTo(x: number, y: number): Path {
      this._path.rMoveTo(x, y);
      return this;
    }

    rQuadTo(x1: number, y1: number, x2: number, y2: number): Path {
      this._path.rQuadTo(x1, y1, x2, y2);
      return this;
    }

    setFillType(fill: FillType): void {
      this._path.setFillType(fill.value as RNSkia.FillType);
    }

    setIsVolatile(volatile: boolean): void {
      this._path.setIsVolatile(volatile);
    }

    simplify(): boolean {
      return this._path.simplify();
    }

    stroke(opts?: StrokeOpts): Path | null {
      const { width, miter_limit, precision, join, cap } = opts ?? {};

      this._path.stroke({
        width,
        miter_limit,

        precision,
        join: join?.value as RNSkia.StrokeJoin,
        cap: cap?.value as RNSkia.StrokeCap,
      });

      return this;
    }

    toCmds(): Float32Array {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    toSVGString(): string {
      return this._path.toSVGString();
    }

    transform(...args: any[]): Path {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    trim(startT: number, stopT: number, isComplement: boolean): Path | null {
      this._path.trim(startT, stopT, isComplement);

      return this;
    }

    static MakeFromCmds(cmds: Float32Array): SKiaPathWrapper | null {
      const path = new SKiaPathWrapper();
      path._path = PathKit.FromCmds(parsePathCmds(cmds));
      return path;
    }
  }

  return SKiaPathWrapper;
}
