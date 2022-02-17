import {
  Skia,
  IPath,
  IPoint,
  FillType,
  PathOp,
  StrokeOpts,
} from '@shopify/react-native-skia';

import type {
  InputFlattenedPointArray,
  InputRect,
  InputRRect,
  VerbList,
  WeightList,
} from 'canvaskit';
import { LTRBArrayToRect, RectToLTRBArray } from 'noya-geometry';
import { JSEmbindObject } from './Embind';

export class SkiaPath extends JSEmbindObject {
  private _path: IPath;

  constructor(path?: IPath) {
    super();

    if (path) {
      this._path = path;
    } else {
      this._path = Skia.Path.Make();
    }
  }

  makeAsWinding(): SkiaPath | null {
    this._path.makeAsWinding();
    return this;
  }

  addArc(oval: InputRect, startAngle: number, sweepAngle: number): SkiaPath {
    this._path.addArc(
      LTRBArrayToRect(oval as Float32Array)!,
      startAngle,
      sweepAngle,
    );

    return this;
  }

  addOval(oval: InputRect, isCCW?: boolean, startIndex?: number): SkiaPath {
    this._path.addOval(
      LTRBArrayToRect(oval as Float32Array)!,
      isCCW,
      startIndex,
    );

    return this;
  }

  addPath(other: SkiaPath): SkiaPath {
    console.warn(`SkiaPath.addPath not implemented!`);
    return this;
  }

  addPoly(points: InputFlattenedPointArray, close: boolean): SkiaPath {
    const p = points as Float32Array;
    const skiaPoints: IPoint[] = [];

    for (let i = 0; i < points.length / 2; i += 2) {
      skiaPoints.push({ x: p[i] as number, y: p[i + 1] });
    }

    this._path.addPoly(skiaPoints, close);

    return this;
  }

  addRect(rect: InputRect, isCCW?: boolean): SkiaPath {
    this._path.addRect(LTRBArrayToRect(rect as Float32Array)!, isCCW);

    return this;
  }

  addRRect(rrect: InputRRect, isCCW?: boolean): SkiaPath {
    const [
      _top, // eslint-disable-line
      _left, // eslint-disable-line
      _right, // eslint-disable-line
      _bottom, // eslint-disable-line
      TLrX,
      TLrY,
      // _TRrX,
      // _TRrY,
      // _BRrX,
      // _BRrY,
      // _BLrX,
      // _BLrY,
    ] = rrect as Float32Array;

    this._path.addRRect({
      rect: LTRBArrayToRect(rrect as Float32Array),
      rx: TLrX,
      ry: TLrY,
    });

    console.warn(
      'React-native skia supports only single radius for all corners',
    );

    return this;
  }

  addVerbsPointsWeights(
    verbs: VerbList,
    points: InputFlattenedPointArray,
    weights?: WeightList,
  ): SkiaPath {
    console.warn(`SkiaPath.addVerbsPointsWeights not implemented!`);

    return this;
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    isCCW?: boolean,
  ): SkiaPath {
    console.warn(`SkiaPath.arc not implemented!`);

    return this;
  }

  arcToOval(
    oval: InputRect,
    startAngle: number,
    endAngle: number,
    forceMoveTo: boolean,
  ): SkiaPath {
    this._path.arcToOval(
      LTRBArrayToRect(oval as Float32Array)!,
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
  ): SkiaPath {
    this._path.arcToRotated(rx, ry, xAxisRotate, useSmallArc, isCCW, x, y);

    return this;
  }

  arcToTangent(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number,
  ): SkiaPath {
    this._path.arcToTangent(x1, y1, x2, y2, radius);
    return this;
  }

  close(): SkiaPath {
    this._path.close();

    return this;
  }

  computeTightBounds(outputArray?: Float32Array): Float32Array {
    const a = RectToLTRBArray(
      this._path.computeTightBounds(
        outputArray ? LTRBArrayToRect(outputArray) : undefined,
      ),
    );

    return a;
  }

  conicTo(x1: number, y1: number, x2: number, y2: number, w: number): SkiaPath {
    this._path.conicTo(x1, y1, x2, y2, w);

    return this;
  }

  contains(x: number, y: number): boolean {
    return this._path.contains(x, y);
  }

  copy(): SkiaPath {
    const pathCopy = this._path.copy();

    return new SkiaPath(pathCopy);
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
  ): SkiaPath {
    this._path.cubicTo(cpx1, cpy1, cpx2, cpy2, x, y);

    return this;
  }

  dash(on: number, off: number, phase: number): boolean {
    return this._path.dash(on, off, phase);
  }

  equals(other: SkiaPath): boolean {
    return this._path.equals((other as SkiaPath)._path);
  }

  getBounds(outputArray?: Float32Array): Float32Array {
    const rect = this._path.getBounds();

    return RectToLTRBArray(rect);
  }

  getFillType(): FillType {
    return this._path.getFillType();
  }

  getPoint(index: number, outputArray?: Float32Array): Float32Array {
    const point = this._path.getPoint(index);
    if (outputArray) {
      // TODO ?????
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

  lineTo(x: number, y: number): SkiaPath {
    this._path.lineTo(x, y);
    return this;
  }

  moveTo(x: number, y: number): SkiaPath {
    this._path.moveTo(x, y);
    return this;
  }

  offset(dx: number, dy: number): SkiaPath {
    this._path.offset(dx, dy);
    return this;
  }

  op(other: SkiaPath, op: PathOp): boolean {
    return this._path.op(other._path, op);
  }

  quadTo(x1: number, y1: number, x2: number, y2: number): SkiaPath {
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
  ): SkiaPath {
    this._path.rArcTo(rx, ry, xAxisRotate, useSmallArc, isCCW, dx, dy);

    return this;
  }

  rConicTo(
    dx1: number,
    dy1: number,
    dx2: number,
    dy2: number,
    w: number,
  ): SkiaPath {
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
  ): SkiaPath {
    this._path.rCubicTo(cpx1, cpy1, cpx2, cpy2, x, y);

    return this;
  }

  reset(): void {
    this._path.reset();
  }

  rewind(): void {
    this._path.rewind();
  }

  rLineTo(x: number, y: number): SkiaPath {
    this._path.rLineTo(x, y);

    return this;
  }

  rMoveTo(x: number, y: number): SkiaPath {
    this._path.rMoveTo(x, y);
    return this;
  }

  rQuadTo(x1: number, y1: number, x2: number, y2: number): SkiaPath {
    this._path.rQuadTo(x1, y1, x2, y2);
    return this;
  }

  setFillType(fill: FillType): void {
    this._path.setFillType(fill);
  }

  setIsVolatile(volatile: boolean): void {
    this._path.setIsVolatile(volatile);
  }

  simplify(): boolean {
    return this._path.simplify();
  }

  stroke(opts?: StrokeOpts): SkiaPath {
    this._path.stroke(opts);

    return this;
  }

  // @ts-ignore
  toCmds(): Float32Array {
    console.warn(`SkiaPath.toCmds not implemented!`);
  }

  toSVGString(): string {
    return this._path.toSVGString();
  }

  transform(...args: any[]): SkiaPath {
    console.warn(`SkiaPath.transform not implemented!`);

    return this;
  }

  trim(startT: number, stopT: number, isComplement: boolean): SkiaPath {
    this._path.trim(startT, stopT, isComplement);

    return this;
  }

  getRNSkiaPath() {
    return this._path;
  }

  static MakeFromCmds(cmds: Float32Array): SkiaPath {
    const path = new SkiaPath();
    // TODO: implement me
    // path._path = PathKit.FromCmds(parsePathCmds(cmds));
    return path;
  }

  static MakeFromOp(one: SkiaPath, two: SkiaPath, op: PathOp): SkiaPath {
    const skiaPath = Skia.Path.MakeFromOp(
      one.getRNSkiaPath(),
      two.getRNSkiaPath(),
      op,
    );

    return new SkiaPath(skiaPath ?? undefined);
  }

  static MakeFromSVGString(str: string): SkiaPath {
    const skiaPath = Skia.Path.MakeFromSVGString(str);

    return new SkiaPath(skiaPath ?? undefined);
  }

  static MakeFromVerbsPointsWeights(
    verbs: VerbList,
    points: InputFlattenedPointArray,
    weights?: WeightList,
  ): SkiaPath {
    const path = new SkiaPath();
    // TODO: implement me
    // path._path = PathKit.FromCmds(parsePathCmds(cmds));
    return path;
  }
}
