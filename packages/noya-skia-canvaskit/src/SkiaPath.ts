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
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    addArc(oval: InputRect, startAngle: number, sweepAngle: number): Path {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    addOval(oval: InputRect, isCCW?: boolean, startIndex?: number): Path {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    addPath(...args: any[]): Path | null {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    addPoly(points: InputFlattenedPointArray, close: boolean): Path {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    addRect(rect: InputRect, isCCW?: boolean): Path {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    addRRect(rrect: InputRRect, isCCW?: boolean): Path {
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
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
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
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
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
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
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
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    equals(other: Path): boolean {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    getBounds(outputArray?: Float32Array): Float32Array {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    getFillType(): EmbindEnumEntity {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    getPoint(index: number, outputArray?: Float32Array): Float32Array {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    isEmpty(): boolean {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    isVolatile(): boolean {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
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
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    op(other: SKiaPathWrapper, op: EmbindEnumEntity): boolean {
      return this._path.op(other._path, op.value as RNSkia.PathOp);
    }

    quadTo(x1: number, y1: number, x2: number, y2: number): Path {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
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
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    rConicTo(
      dx1: number,
      dy1: number,
      dx2: number,
      dy2: number,
      w: number,
    ): Path {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    rCubicTo(
      cpx1: number,
      cpy1: number,
      cpx2: number,
      cpy2: number,
      x: number,
      y: number,
    ): Path {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    reset(): void {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    rewind(): void {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    rLineTo(x: number, y: number): Path {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    rMoveTo(x: number, y: number): Path {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    rQuadTo(x1: number, y1: number, x2: number, y2: number): Path {
      this._path.rQuadTo(x1, y1, x2, y2);
      return this;
    }

    setFillType(fill: FillType): void {
      this._path.setFillType(fill.value as RNSkia.FillType);
    }

    setIsVolatile(volatile: boolean): void {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    simplify(): boolean {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
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
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    transform(...args: any[]): Path {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    trim(startT: number, stopT: number, isComplement: boolean): Path | null {
      throw new Error(
        `${this.constructor.name}.${arguments.callee.name} not implemented!`,
      );
    }

    static MakeFromCmds(cmds: Float32Array): SKiaPathWrapper | null {
      const path = new SKiaPathWrapper();
      path._path = PathKit.FromCmds(parsePathCmds(cmds));
      return path;
    }
  }

  return SKiaPathWrapper;
}
