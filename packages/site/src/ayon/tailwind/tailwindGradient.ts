// type GradientDirections = {
//   [key: string]: string;
// };

const GRADIENT_DIRECTIONS = {
  'bg-gradient-to-t': 'to top',
  'bg-gradient-to-tr': 'to top right',
  'bg-gradient-to-r': 'to right',
  'bg-gradient-to-br': 'to bottom right',
  'bg-gradient-to-b': 'to bottom',
  'bg-gradient-to-bl': 'to bottom left',
  'bg-gradient-to-l': 'to left',
  'bg-gradient-to-tl': 'to top left',
};

/**
 * Extract gradient classnames to create a background image.
 * There will be a direction class (e.g. bg-gradient-to-r) and
 * a from/to color stop class (e.g. from-red-500 to-blue-500).
 * See: https://tailwindcss.com/docs/gradient-color-stops
 *
 * https://chat.openai.com/share/93b56c90-5290-4638-9f36-89e6674be3e9
 */
export function tailwindToLinearGradient(
  classes: string[],
  getColor: (colorName: string) => string,
): string {
  let direction = 'to right';
  let fromColor = 'transparent';
  let toColor = 'transparent';

  for (const class_ of classes) {
    if (class_ in GRADIENT_DIRECTIONS) {
      direction =
        GRADIENT_DIRECTIONS[class_ as keyof typeof GRADIENT_DIRECTIONS];
    } else if (class_.startsWith('from-')) {
      fromColor = getColor(class_.substring(5));
    } else if (class_.startsWith('to-')) {
      toColor = getColor(class_.substring(3));
    }
  }

  return `linear-gradient(${direction}, ${fromColor}, ${toColor})`;
}
