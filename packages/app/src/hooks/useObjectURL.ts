import { useLayoutEffect, useMemo } from 'react';

export function useObjectURL(object?: ArrayBuffer | Uint8Array | Blob) {
  const objectURL = useMemo(() => {
    if (object instanceof Blob) return URL.createObjectURL(object);

    const bytes =
      object instanceof Uint8Array
        ? object
        : object !== undefined
        ? new Uint8Array(object)
        : new Uint8Array();

    return URL.createObjectURL(new Blob([bytes]));
  }, [object]);

  useLayoutEffect(() => {
    return () => URL.revokeObjectURL(objectURL);
  }, [objectURL]);

  return objectURL;
}
