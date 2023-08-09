import { useGeneratedComponentLayout, useNoyaClient } from 'noya-api';
import { ActivityIndicator, IconButton } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import React, { memo, useCallback, useEffect } from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { DSLayoutTree } from '../../../dseditor/DSLayoutTree';
import { embedRootLevelDiff } from '../../../dseditor/traversal';
import { NoyaComponent, NoyaDiff } from '../../../dseditor/types';
import { useAyonDispatch } from '../../state/ayonState';
import { CustomLayerData } from '../../types';

type Props = {
  selectedLayer: Sketch.CustomLayer<CustomLayerData>;
  highlightedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
};

export const ComponentLayoutInspector = memo(function ComponentLayoutInspector({
  selectedLayer,
  highlightedPath,
  setHighlightedPath,
}: Props) {
  const dispatch = useAyonDispatch();
  const client = useNoyaClient();
  const generatedLayouts = useGeneratedComponentLayout(
    selectedLayer.name ?? '',
    selectedLayer.data.description ?? '',
  );

  useEffect(() => {
    if (
      !selectedLayer.name ||
      !selectedLayer.data.description ||
      selectedLayer.data.node !== undefined
    ) {
      return;
    }

    client.generate.componentLayouts({
      name: selectedLayer.name,
      description: selectedLayer.data.description,
    });
  }, [
    client,
    dispatch,
    selectedLayer.data.description,
    selectedLayer.data.node,
    selectedLayer.name,
  ]);

  const handleShuffle = useCallback(() => {
    dispatch('setLayerNode', selectedLayer.do_objectID, undefined);
    client.generate.resetComponentLayouts(
      selectedLayer.name,
      selectedLayer.data.description ?? '',
    );
  }, [
    client.generate,
    dispatch,
    selectedLayer.data.description,
    selectedLayer.do_objectID,
    selectedLayer.name,
  ]);

  const node = selectedLayer.data.node;

  const findComponent = useCallback((id: string): NoyaComponent | undefined => {
    return undefined;
  }, []);

  const handleSetDiff = useCallback(
    (diff: NoyaDiff) => {
      if (!node) return;
      const newNode = embedRootLevelDiff(node, diff);
      dispatch('setLayerNode', selectedLayer.do_objectID, newNode);
    },
    [dispatch, node, selectedLayer.do_objectID],
  );

  return (
    <InspectorSection
      title="Layout"
      titleTextStyle="heading4"
      right={
        generatedLayouts.loading ? (
          <ActivityIndicator size={13} />
        ) : (
          <IconButton
            iconName="ShuffleIcon"
            onClick={handleShuffle}
            size={13}
            disabled={!selectedLayer.data.description}
          />
        )
      }
    >
      {node && node.type !== 'noyaString' ? (
        <DSLayoutTree
          rootNode={node}
          setDiff={handleSetDiff}
          findComponent={findComponent}
          highlightedPath={highlightedPath}
          setHighlightedPath={setHighlightedPath}
        />
      ) : null}
    </InspectorSection>
  );
});
