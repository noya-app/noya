import { useGeneratedLayout, useNoyaClient } from 'noya-api';
import { ActivityIndicator, IconButton } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import React, { memo, useCallback, useMemo } from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { DSLayoutTree } from '../../../dseditor/DSLayoutTree';
import { parseLayout } from '../../../dseditor/componentLayout';
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
  const generatedLayout = useGeneratedLayout(
    selectedLayer.name ?? '',
    selectedLayer.data.description ?? '',
  );

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

  const node = useMemo(() => {
    if (selectedLayer.data.node) return selectedLayer.data.node;

    if (generatedLayout.layout) {
      return parseLayout(generatedLayout.layout);
    }
  }, [generatedLayout.layout, selectedLayer.data.node]);

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
        generatedLayout.loading ? (
          <ActivityIndicator size={13} />
        ) : (
          <IconButton
            iconName="ShuffleIcon"
            onClick={handleShuffle}
            size={13}
            disabled={!selectedLayer.data.description}
            tooltip="Generate new layout"
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
