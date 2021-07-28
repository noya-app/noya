import { useEffect, useState } from 'react';
import useLazyValue from './useLazyValue';

const preferDarkQuery = '(prefers-color-scheme: dark)';

type ColorScheme = 'light' | 'dark';

export default function useSystemColorScheme() {
  const mediaQuery = useLazyValue(() => global.matchMedia(preferDarkQuery));

  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    mediaQuery.matches ? 'dark' : 'light',
  );

  useEffect(() => {
    const listener = ({ matches }: MediaQueryListEvent) => {
      setColorScheme(matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, [mediaQuery]);

  return colorScheme;
}
