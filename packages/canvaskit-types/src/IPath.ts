import { EnumEntity } from './Enums';

export interface IPath {
  addArc(
    oval: InputRect,
    startAngle: AngleInDegrees,
    sweepAngle: AngleInDegrees,
  ): Path;

  addOval(oval: InputRect, isCCW?: boolean, startIndex?: number): Path;

  addPath(...args: any[]): Path | null;

  addPoly(points: InputFlattenedPointArray, close: boolean): Path;

  addRect(rect: InputRect, isCCW?: boolean): Path;

  addRRect(rrect: InputRRect, isCCW?: boolean): Path;

  addVerbsPointsWeights(
    verbs: VerbList,
    points: InputFlattenedPointArray,
    weights?: WeightList,
  ): Path;

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: AngleInRadians,
    endAngle: AngleInRadians,
    isCCW?: boolean,
  ): Path;

  arcToOval(
    oval: InputRect,
    startAngle: AngleInDegrees,
    endAngle: AngleInDegrees,
    forceMoveTo: boolean,
  ): Path;

  arcToRotated(
    rx: number,
    ry: number,
    xAxisRotate: AngleInDegrees,
    useSmallArc: boolean,
    isCCW: boolean,
    x: number,
    y: number,
  ): Path;

  arcToTangent(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number,
  ): Path;

  close(): Path;

  computeTightBounds(outputArray?: Rect): Rect;

  conicTo(x1: number, y1: number, x2: number, y2: number, w: number): Path;

  contains(x: number, y: number): boolean;

  copy(): Path;

  countPoints(): number;

  cubicTo(
    cpx1: number,
    cpy1: number,
    cpx2: number,
    cpy2: number,
    x: number,
    y: number,
  ): Path;

  dash(on: number, off: number, phase: number): boolean;

  equals(other: Path): boolean;

  getBounds(outputArray?: Rect): Rect;

  getFillType(): FillType;

  getPoint(index: number, outputArray?: Point): Point;

  isEmpty(): boolean;

  isVolatile(): boolean;

  lineTo(x: number, y: number): Path;

  makeAsWinding(): Path | null;

  moveTo(x: number, y: number): Path;

  offset(dx: number, dy: number): Path;

  op(other: Path, op: PathOp): boolean;

  quadTo(x1: number, y1: number, x2: number, y2: number): Path;

  rArcTo(
    rx: number,
    ry: number,
    xAxisRotate: AngleInDegrees,
    useSmallArc: boolean,
    isCCW: boolean,
    dx: number,
    dy: number,
  ): Path;

  rConicTo(dx1: number, dy1: number, dx2: number, dy2: number, w: number): Path;

  rCubicTo(
    cpx1: number,
    cpy1: number,
    cpx2: number,
    cpy2: number,
    x: number,
    y: number,
  ): Path;

  reset(): void;

  rewind(): void;

  rLineTo(x: number, y: number): Path;

  rMoveTo(x: number, y: number): Path;

  rQuadTo(x1: number, y1: number, x2: number, y2: number): Path;

  setFillType(fill: FillType): void;

  setIsVolatile(volatile: boolean): void;

  simplify(): boolean;

  stroke(opts?: StrokeOpts): Path | null;

  toCmds(): Float32Array;

  toSVGString(): string;

  transform(...args: any[]): Path;

  trim(startT: number, stopT: number, isComplement: boolean): Path | null;
}
