export const sortBy = (array: any[], key: string) =>
  [...array].sort((a, b) => {
    const aName = a[key].toUpperCase();
    const bName = b[key].toUpperCase();

    return aName > bName ? 1 : aName < bName ? -1 : 0;
  });
