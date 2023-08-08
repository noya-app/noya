import { useGeneratedComponentLayouts, useNoyaClient } from 'noya-api';
import { parseComponentLayout } from 'noya-compiler';
import { ActivityIndicator, IconButton } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import React, { memo, useCallback, useEffect } from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { DSLayoutTree } from '../../../dseditor/DSLayoutTree';
import { convertLayoutToComponent } from '../../../dseditor/componentLayout';
import { embedRootLevelDiff } from '../../../dseditor/traversal';
import { NoyaComponent, NoyaDiff } from '../../../dseditor/types';
import { useAyonState } from '../../state/ayonState';
import { CustomLayerData } from '../../types';

type Props = {
  selectedLayer: Sketch.CustomLayer<CustomLayerData>;
};

export const ComponentLayoutInspector = memo(function ComponentLayoutInspector({
  selectedLayer,
}: Props) {
  const [, dispatch] = useAyonState();
  const client = useNoyaClient();
  const generatedLayouts = useGeneratedComponentLayouts(
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

  // eslint-disable-next-line @shopify/prefer-early-return
  useEffect(() => {
    if (
      selectedLayer.data.node === undefined &&
      generatedLayouts.layouts &&
      !generatedLayouts.loading
    ) {
      const parsed = generatedLayouts.layouts.map((layout) =>
        parseComponentLayout(layout.code),
      );

      if (parsed.length === 0) return;

      const node = convertLayoutToComponent(parsed[0]);

      dispatch('setLayerNode', node);
    }
  }, [dispatch, generatedLayouts, selectedLayer.data.node]);

  const handleShuffle = useCallback(() => {
    dispatch('setLayerNode', undefined);
    client.generate.resetComponentLayouts(
      selectedLayer.name,
      selectedLayer.data.description ?? '',
    );
  }, [
    client.generate,
    dispatch,
    selectedLayer.data.description,
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
      dispatch('setLayerNode', newNode);
    },
    [dispatch, node],
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
          setHighlightedPath={() => {}}
        />
      ) : null}
    </InspectorSection>
  );
});
