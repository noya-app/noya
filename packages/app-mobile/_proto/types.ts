export enum ToolMode {
  Default = 'Default', // tap & select box
  // probably should be more generic create event
  // with separate enum/state for each object type
  CreateRect = 'CreateRect',
  CreateImage = 'CreateImage',
  CreatePath = 'CreatePath',
}

// ctx - Skia drawer context
type AnimatedNumber = number | ((ctx: any) => number);

export interface Position {
  x: AnimatedNumber;
  y: AnimatedNumber;
}

export interface Size {
  width: AnimatedNumber;
  height: AnimatedNumber;
}

export interface Stroke {
  width: AnimatedNumber;
  color: string;
}

export enum ElementType {
  Rect = 'Rect',
  Image = 'Image',
  Path = 'Path',
}

export interface CanvasElement {
  type: ElementType;
  isActive?: boolean;
}

export interface Rect extends CanvasElement {
  size: Size;
  position: Position;

  // Optional properties
  color?: string;
  stroke?: Stroke;
}

export interface Image extends CanvasElement {
  size: Size;
  position: Position;
  source: string; // path for require statement?
  fit:
    | 'cover'
    | 'contain'
    | 'fill'
    | 'fitHeight'
    | 'fitWidth'
    | 'none'
    | 'scaleDown';
}

export interface Path extends CanvasElement {
  points: Position[];
  closed?: boolean;
  color: string;
  width?: number;
}
