import { EnumEntity } from './Enums';

export interface DefaultConstructor<T> {
  new (): T;
}

export interface StrokeOpts {
  width?: number;
  miter_limit?: number;

  precision?: number;
  join?: EnumEntity;
  cap?: EnumEntity;
}
