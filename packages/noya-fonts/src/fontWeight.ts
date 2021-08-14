export const ALL_FONT_WEIGHTS = [
  'ultralight',
  'thin',
  'light',
  'regular',
  'medium',
  'semibold',
  'bold',
  'heavy',
  'black',
];

export type FontWeight =
  | 'ultralight'
  | 'thin'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'heavy'
  | 'black';

export function isValidFontWeight(string: string): string is FontWeight {
  switch (string) {
    case 'ultralight':
    case 'thin':
    case 'light':
    case 'regular':
    case 'medium':
    case 'semibold':
    case 'bold':
    case 'heavy':
    case 'black':
      return true;
    default:
      return false;
  }
}
