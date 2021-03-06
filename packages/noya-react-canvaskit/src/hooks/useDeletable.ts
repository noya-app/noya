import { useEffect, useRef } from 'react';

interface Deletable {
  delete: () => void;
  isDeleted: () => boolean;
}

export default function useDeletable<T extends Deletable>(object: T): T;
export default function useDeletable<T extends Deletable>(
  object: T | undefined,
): T | undefined;
export default function useDeletable<T extends Deletable>(
  object: T | undefined,
): T | undefined {
  const ref = useRef<T | undefined>(object);

  // Delete whenever the value changes
  if (ref.current !== object) {
    if (ref.current && !ref.current.isDeleted()) {
      ref.current.delete();
    }

    ref.current = object;
  }

  // Delete on unmount
  useEffect(() => {
    return () => {
      if (ref.current && !ref.current.isDeleted()) {
        ref.current.delete();
      }
    };
  }, []);

  return object;
}
