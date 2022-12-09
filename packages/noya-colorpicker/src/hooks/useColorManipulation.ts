import { useDeepMemo } from 'noya-react-utils';
import { useCallback } from 'react';
import { AnyColor, ColorModel, HsvaColor } from '../types';

// TODO: Fix jitter, hopefully without useEffect
export function useColorManipulation<T extends AnyColor>(
  colorModel: ColorModel<T>,
  color: T,
  onChange?: (color: T) => void,
): [HsvaColor, (color: Partial<HsvaColor>) => void] {
  const hsva = useDeepMemo(colorModel.toHsva(color));

  const handleChange = useCallback(
    (params: Partial<HsvaColor>) => {
      onChange?.(colorModel.fromHsva({ ...hsva, ...params }))
    },
    [colorModel, hsva, onChange],
  );

  return [hsva, handleChange];
}
