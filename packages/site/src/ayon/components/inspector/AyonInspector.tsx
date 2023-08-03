import { useApplicationState } from 'noya-app-state-context';
import { ScrollArea, Stack, useDesignSystemTheme } from 'noya-designsystem';
import { useShallowArray } from 'noya-react-utils';
import { Layers, Selectors } from 'noya-state';
import React, { ComponentProps } from 'react';
import { AyonLayerInspector } from './AyonLayerInspector';
import { AyonProjectInspector } from './AyonProjectInspector';
import { CustomLayerInspector } from './CustomLayerInspector';

export function AyonInspector({
  name,
  onChangeName,
  onDuplicate,
  setOverriddenBlock,
}: Omit<ComponentProps<typeof AyonLayerInspector>, 'selectedLayer'> &
  ComponentProps<typeof AyonProjectInspector>) {
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
          <CustomLayerInspector selectedLayer={selectedLayers[0]} />
        ) : selectedLayers.length === 0 ? (
          <AyonProjectInspector
            name={name}
            onChangeName={onChangeName}
            onDuplicate={onDuplicate}
          />
        ) : null}
      </ScrollArea>
    </Stack.V>
  );
}
