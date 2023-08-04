import { useGeneratedComponentLayouts, useNoyaClient } from 'noya-api';
import { parseComponentLayout } from 'noya-compiler';
import { ActivityIndicator, IconButton } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { InspectorPrimitives } from 'noya-inspector';
import React, { memo, useCallback, useEffect } from 'react';
import { convertLayoutToComponent } from '../../../dseditor/componentLayout';
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

  return (
    <InspectorPrimitives.LabeledRow
      label="Layout"
      right={
        generatedLayouts.loading ? (
          <ActivityIndicator size={13} />
        ) : (
          <IconButton
            iconName="ShuffleIcon"
            onClick={handleShuffle}
            size={13}
          />
        )
      }
    >
      {null}
    </InspectorPrimitives.LabeledRow>
  );
});
