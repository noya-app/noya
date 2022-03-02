import { IFillType, IPathOp } from './Enums';
import { DefaultConstructor, IStrokeOpts, EmbindObject } from './misc';

export interface IPath<IRect> extends EmbindObject {
  addOval(oval: IRect, isCCW?: boolean, startIndex?: number): IPath<IRect>;

  addPath(...args: any[]): IPath<IRect> | null;

  addRect(rect: IRect, isCCW?: boolean): IPath<IRect>;

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    isCCW?: boolean,
  ): IPath<IRect>;

  arcToTangent(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number,
  ): IPath<IRect>;

  close(): IPath<IRect>;

  computeTightBounds(): number[];

  contains(x: number, y: number): boolean;

  copy(): IPath<IRect>;

  cubicTo(
    cpx1: number,
    cpy1: number,
    cpx2: number,
    cpy2: number,
    x: number,
    y: number,
  ): IPath<IRect>;

  equals(other: IPath<IRect>): boolean;

  getFillType(): IFillType;

  lineTo(x: number, y: number): IPath<IRect>;

  moveTo(x: number, y: number): IPath<IRect>;

  offset(dx: number, dy: number): IPath<IRect>;

  op(other: IPath<IRect>, op: IPathOp): boolean;

  quadTo(x1: number, y1: number, x2: number, y2: number): IPath<IRect>;

  reset(): void;

  rewind(): void;

  setFillType(fill: IFillType): void;

  stroke(opts?: IStrokeOpts): IPath<IRect> | null;

  toCmds(): Float32Array;

  toSVGString(): string;

  trim(
    startT: number,
    stopT: number,
    isComplement: boolean,
  ): IPath<IRect> | null;
}

export interface IPathConstructorAndFactory<IRect, Path extends IPath<IRect>>
  extends DefaultConstructor<Path> {
  MakeFromOp(one: Path, two: Path, op: IPathOp): Path | null;

  MakeFromSVGString(str: string): Path | null;
}
