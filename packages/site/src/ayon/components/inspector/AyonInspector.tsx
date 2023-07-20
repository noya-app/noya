import { useApplicationState } from 'noya-app-state-context';
import { ScrollArea, Stack, useDesignSystemTheme } from 'noya-designsystem';
import { useShallowArray } from 'noya-react-utils';
import { Layers, Selectors } from 'noya-state';
import React, { ComponentProps } from 'react';
import { AyonLayerInspector } from './AyonLayerInspector';

export function AyonInspector(
  props: Omit<ComponentProps<typeof AyonLayerInspector>, 'selectedLayer'>,
) {
  const theme = useDesignSystemTheme();
  const [state] = useApplicationState();

  const selectedLayers = useShallowArray(
    Selectors.getSelectedLayers(state).filter(Layers.isSymbolInstance),
  );

  return (
    <Stack.V
      background={'white'}
      width={'400px'}
      borderLeft={`1px solid ${theme.colors.dividerStrong}`}
    >
      <ScrollArea>
        {selectedLayers.length === 1 ? (
          <AyonLayerInspector {...props} selectedLayer={selectedLayers[0]} />
        ) : null}
      </ScrollArea>
    </Stack.V>
  );
}
