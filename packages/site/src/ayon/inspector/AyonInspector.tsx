import { Stack, useDesignSystemTheme } from 'noya-designsystem';
import React, { ComponentProps } from 'react';
import { AyonLayerInspector } from './AyonLayerInspector';

export function AyonInspector(
  props: ComponentProps<typeof AyonLayerInspector>,
) {
  const theme = useDesignSystemTheme();

  return (
    <Stack.V
      width={'400px'}
      borderLeft={`1px solid ${theme.colors.dividerStrong}`}
    >
      <AyonLayerInspector {...props} />
    </Stack.V>
  );
}
