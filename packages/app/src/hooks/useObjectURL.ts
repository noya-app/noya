import { useLayoutEffect, useMemo } from 'react';

export function useObjectURL(object: string | ArrayBuffer | Uint8Array | Blob) {
  const objectURL = useMemo(() => {
    if (typeof object === 'string') return object;
    if (object instanceof Blob) return URL.createObjectURL(object);

    const bytes =
      object instanceof Uint8Array ? object : new Uint8Array(object);

    return URL.createObjectURL(new Blob([bytes]));
  }, [object]);
  useLayoutEffect(() => {
    return () => URL.revokeObjectURL(objectURL);
  }, [objectURL]);
  return objectURL;
}
