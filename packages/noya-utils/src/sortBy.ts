export function sortBy<
  K extends PropertyKey,
  Item extends { [key in K]: string }
>(array: Item[], key: K) {
  return [...array].sort((a, b) => {
    const aName = a[key].toUpperCase();
    const bName = b[key].toUpperCase();

    return aName > bName ? 1 : aName < bName ? -1 : 0;
  });
}
