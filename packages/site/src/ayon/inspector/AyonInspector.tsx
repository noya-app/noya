import { Stack, useDesignSystemTheme } from 'noya-designsystem';
import React from 'react';
import { AyonLayerInspector } from './AyonLayerInspector';

export function AyonInspector() {
  const theme = useDesignSystemTheme();

  return (
    <Stack.V
      width={'400px'}
      borderLeft={`1px solid ${theme.colors.dividerStrong}`}
    >
      <AyonLayerInspector />
    </Stack.V>
  );
}
