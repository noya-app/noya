declare module 'color-parse' {
  export default function parse(value: string): {
    space: string;
    values: number[];
    alpha: number;
  } {}
}
