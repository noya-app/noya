import { useEffect, useState } from 'react';

export function usePixelRatio() {
  const [pixelRatio, setPixelRatio] = useState(() => window.devicePixelRatio);

  useEffect(() => {
    const mediaQuery = matchMedia(`(resolution: ${pixelRatio}dppx)`);

    const handler = () => {
      setPixelRatio(window.devicePixelRatio);
    };

    mediaQuery.addEventListener('change', handler, { once: true });

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [pixelRatio]);

  return pixelRatio;
}
