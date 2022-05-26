import {
  Skia,
  FillType,
  PathOp,
  StrokeOpts,
  SkPath,
} from '@shopify/react-native-skia';

import { IPath } from 'canvaskit-types';
import { RectToLTRBArray } from 'noya-geometry';
import { JSEmbindObject } from './misc';
import { Rect } from './types';

export default class PathNative extends JSEmbindObject implements IPath<Rect> {
  private _path: SkPath;

  constructor(path?: SkPath) {
    super();

    if (path) {
      this._path = path;
    } else {
      this._path = Skia.Path.Make();
    }
  }

  addOval(oval: Rect, isCCW?: boolean, startIndex?: number): PathNative {
    this._path.addOval(oval, isCCW ?? false, startIndex ?? 0);

    return this;
  }

  addPath(...args: any[]): PathNative | null {
    console.warn(`SkiaPath.addPath not implemented!`);
    return this;
  }

  addRect(rect: Rect, isCCW?: boolean): PathNative {
    this._path.addRect(rect, isCCW ?? false);

    return this;
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    isCCW?: boolean,
  ): PathNative {
    console.warn(`SkiaPath.arc not implemented!`);

    return this;
  }

  arcToTangent(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number,
  ): PathNative {
    this._path.arcToTangent(x1, y1, x2, y2, radius);

    return this;
  }

  close(): PathNative {
    this._path.close();
    return this;
  }

  computeTightBounds(): number[] {
    const rect = this._path.computeTightBounds();

    return RectToLTRBArray(rect);
  }

  contains(x: number, y: number): boolean {
    return this._path.contains(x, y);
  }

  copy(): PathNative {
    const pathCopy = this._path.copy();

    return new PathNative(pathCopy);
  }

  cubicTo(
    cpx1: number,
    cpy1: number,
    cpx2: number,
    cpy2: number,
    x: number,
    y: number,
  ): PathNative {
    this._path.cubicTo(cpx1, cpy1, cpx2, cpy2, x, y);

    return this;
  }

  equals(other: PathNative): boolean {
    return this._path.equals(other._path);
  }

  getFillType(): FillType {
    return this._path.getFillType();
  }

  lineTo(x: number, y: number): PathNative {
    this._path.lineTo(x, y);

    return this;
  }

  moveTo(x: number, y: number): PathNative {
    this._path.moveTo(x, y);

    return this;
  }

  offset(dx: number, dy: number): PathNative {
    this._path.offset(dx, dy);

    return this;
  }

  op(other: PathNative, op: PathOp): boolean {
    return this._path.op(other._path, op);
  }

  quadTo(x1: number, y1: number, x2: number, y2: number): PathNative {
    this._path.quadTo(x1, y1, x2, y2);

    return this;
  }

  reset(): void {
    this._path.reset();
  }

  rewind(): void {
    this._path.rewind();
  }

  setFillType(fill: FillType): void {
    this._path.setFillType(fill);
  }

  stroke(opts?: StrokeOpts): PathNative | null {
    this._path.stroke(opts);

    return this;
  }

  toCmds(): Float32Array {
    const pathCommands: number[] = [];
    const skiaPathCommands = this._path.toCmds();

    // For commands other than move (verb === 0)
    // react-native-skia adds aditional start position
    // as 2nd and 3rd parameter in command
    skiaPathCommands.forEach((command) => {
      const [verb, startX, startY, ...rest] = command;

      if (verb === 0) {
        pathCommands.push(verb, startX, startY);
      } else {
        pathCommands.push(verb, ...rest);
      }
    });

    return new Float32Array(pathCommands);
  }

  toSVGString(): string {
    return this._path.toSVGString();
  }

  trim(
    startT: number,
    stopT: number,
    isComplement: boolean,
  ): PathNative | null {
    this._path.trim(startT, stopT, isComplement);

    return this;
  }

  getRNSPath() {
    return this._path;
  }

  static MakeFromOp(one: PathNative, two: PathNative, op: PathOp): PathNative {
    const skiaPath = Skia.Path.MakeFromOp(one._path, two._path, op);

    return new PathNative(skiaPath ?? undefined);
  }

  static MakeFromSVGString(str: string): PathNative {
    const skiaPath = Skia.Path.MakeFromSVGString(str);

    return new PathNative(skiaPath ?? undefined);
  }
}
