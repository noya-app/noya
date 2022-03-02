import { EmbindObject } from './misc';
import { IPath } from './IPath';

export type PosTan = number[];

export interface ContourMeasure<IRect> extends EmbindObject {
  getPosTan(distance: number, output?: PosTan): PosTan;
  getSegment(
    startD: number,
    stopD: number,
    startWithMoveTo: boolean,
  ): IPath<IRect>;
  isClosed(): boolean;
  length(): number;
}

export interface ContourMeasureIter<IRect> extends EmbindObject {
  next(): ContourMeasure<IRect> | null;
}

export interface IContourMeasureIterConstructor<IRect> {
  new (
    path: IPath<IRect>,
    forceClosed: boolean,
    resScale: number,
  ): ContourMeasureIter<IRect>;
}
