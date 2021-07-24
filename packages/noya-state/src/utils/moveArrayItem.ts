export function moveArrayItem<T>(
  array: T[],
  sourceIndex: number,
  destinationIndex: number,
) {
  const sourceItem = array[sourceIndex];

  array.splice(sourceIndex, 1);

  array.splice(
    sourceIndex < destinationIndex ? destinationIndex - 1 : destinationIndex,
    0,
    sourceItem,
  );
}
