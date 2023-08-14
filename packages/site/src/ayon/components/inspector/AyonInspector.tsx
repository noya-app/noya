import { useApplicationState } from 'noya-app-state-context';
import { ScrollArea, Stack, useDesignSystemTheme } from 'noya-designsystem';
import { useShallowArray } from 'noya-react-utils';
import { Layers, Selectors } from 'noya-state';
import React, { memo } from 'react';
import { NoyaNode } from '../../../dseditor/types';
import { CustomLayerData } from '../../types';
import { AyonProjectInspector } from './AyonProjectInspector';
import { CustomLayerInspector } from './CustomLayerInspector';

type Props = {
  name: string;
  onChangeName?: (name: string) => void;
  onDuplicate?: () => void;
  highlightedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
  setPreviewNode: (node: NoyaNode | undefined) => void;
};

export const AyonInspector = memo(function AyonInspector({
  name,
  onChangeName,
  onDuplicate,
  highlightedPath,
  setHighlightedPath,
  setPreviewNode,
}: Props) {
  const theme = useDesignSystemTheme();
  const [state] = useApplicationState();

  const selectedLayers = useShallowArray(
    Selectors.getSelectedLayers(state).filter(
      Layers.isCustomLayer<CustomLayerData>,
    ),
  );

  return (
    <Stack.V
      background={'white'}
      width={'400px'}
      borderLeft={`1px solid ${theme.colors.dividerStrong}`}
    >
      <ScrollArea>
        {selectedLayers.length === 1 ? (
          <CustomLayerInspector
            selectedLayer={selectedLayers[0]}
            highlightedPath={highlightedPath}
            setHighlightedPath={setHighlightedPath}
            setPreviewNode={setPreviewNode}
          />
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
});
