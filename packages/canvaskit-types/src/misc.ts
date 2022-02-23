export interface DefaultConstructor<T> {
  new (): T;
}

export interface ITonalColor<IColor> {
  ambient: IColor;
  spot: IColor;
}
