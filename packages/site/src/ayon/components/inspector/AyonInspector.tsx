import { useApplicationState } from 'noya-app-state-context';
import { ScrollArea, Stack, useDesignSystemTheme } from 'noya-designsystem';
import { useShallowArray } from 'noya-react-utils';
import { Layers, Selectors } from 'noya-state';
import React, { memo, useCallback } from 'react';
import { NoyaNode } from '../../../dseditor/types';
import { CustomLayerData, NodePath } from '../../types';
import { AyonProjectInspector } from './AyonProjectInspector';
import { CustomLayerInspector } from './CustomLayerInspector';

type Props = {
  name: string;
  onChangeName?: (name: string) => void;
  onDuplicate?: () => void;
  highlightedNodePath?: NodePath;
  setHighlightedNodePath: (value: NodePath | undefined) => void;
  setPreviewNode: (node: NoyaNode | undefined) => void;
};

export const AyonInspector = memo(function AyonInspector({
  name,
  onChangeName,
  onDuplicate,
  highlightedNodePath,
  setHighlightedNodePath,
  setPreviewNode,
}: Props) {
  const theme = useDesignSystemTheme();
  const [state] = useApplicationState();

  const selectedLayers = useShallowArray(
    Selectors.getSelectedLayers(state).filter(
      Layers.isCustomLayer<CustomLayerData>,
    ),
  );

  const highlightedPath =
    highlightedNodePath &&
    highlightedNodePath.layerId === selectedLayers[0]?.do_objectID
      ? highlightedNodePath.path
      : undefined;

  const setHighlightedPath = useCallback(
    (path: string[] | undefined) => {
      setHighlightedNodePath(
        selectedLayers[0] && path
          ? { layerId: selectedLayers[0].do_objectID, path }
          : undefined,
      );
    },
    [selectedLayers, setHighlightedNodePath],
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
