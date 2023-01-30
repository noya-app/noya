export type SelectionType =
  | 'replace'
  | 'intersection'
  | 'difference'
  | 'symmetricDifference';

export function updateSelection<T extends string | number>(
  currentIds: T[],
  newIds: T | T[] | undefined,
  selectionType: SelectionType,
) {
  const ids =
    newIds === undefined ? [] : Array.isArray(newIds) ? newIds : [newIds];

  switch (selectionType) {
    case 'intersection':
      currentIds.push(...ids.filter((id) => !currentIds.includes(id)));
      return;
    case 'difference':
      ids.forEach((id) => {
        const selectedIndex = currentIds.indexOf(id);
        currentIds.splice(selectedIndex, 1);
      });
      return;
    case 'replace':
      // Update currentIds array in-place
      currentIds.length = 0;
      currentIds.push(...ids);
      return;
    case 'symmetricDifference':
      ids.forEach((id) => {
        const selectedIndex = currentIds.indexOf(id);
        if (selectedIndex === -1) {
          currentIds.push(id);
        } else {
          currentIds.splice(selectedIndex, 1);
        }
      });
      return;
  }
}

export function makeSelection(
  a: string[],
  b: string[],
  selectionType: SelectionType,
): string[] {
  const selection = [...a];
  updateSelection(selection, b, selectionType);
  return selection;
}
