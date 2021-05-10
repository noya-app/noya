export type SelectionType = 'replace' | 'intersection' | 'difference';

export function updateSelection(
  currentIds: string[],
  newIds: string | string[] | undefined,
  selectionType: SelectionType,
) {
  const ids =
    newIds === undefined ? [] : typeof newIds === 'string' ? [newIds] : newIds;

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
  }
}
