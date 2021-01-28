import { Children, cloneElement, isValidElement, ReactNode } from 'react';

function createKey(key: string | number) {
  return `s-${key}`;
}

export default function withSeparatorElements(
  elements: ReactNode,
  separator: ReactNode | (() => ReactNode),
) {
  const childrenArray = Children.toArray(elements);

  for (let i = childrenArray.length - 1; i >= 0; i--) {
    let sep =
      typeof separator === 'function'
        ? separator()
        : isValidElement(separator)
        ? cloneElement(separator, { key: createKey(i) })
        : separator;

    if (isValidElement(sep) && sep.key == null) {
      sep = cloneElement(sep, { key: createKey(i) });
    }

    childrenArray.splice(i, 0, sep);
  }

  return childrenArray;
}
