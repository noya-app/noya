import {
  MenuItem,
  RegularMenuItem,
  SEPARATOR_ITEM,
} from '../components/internal/Menu';

type Optional<T> = T | false | null | undefined;

function withSeparators<T>(elements: T[], separator: T) {
  const result: T[] = [];

  for (let i = 0; i < elements.length; i++) {
    result.push(elements[i]);

    if (i !== elements.length - 1) {
      result.push(separator);
    }
  }

  return result;
}

export function createSectionedMenu<T extends string>(
  ...sections: Optional<Optional<RegularMenuItem<T>>[]>[]
): MenuItem<T>[] {
  const nonEmptySections = sections
    .flatMap((section) => (section ? [section] : []))
    .map((section) => section.flatMap((item) => (item ? [item] : [])))
    .filter((section) => section.length > 0);

  return withSeparators<MenuItem<T>[]>(nonEmptySections, [
    SEPARATOR_ITEM,
  ]).flat();
}
