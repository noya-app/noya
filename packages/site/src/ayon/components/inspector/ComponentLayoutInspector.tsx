import { useGeneratedLayout, useNoyaClient } from 'noya-api';
import { ActivityIndicator, Button, IconButton } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { InspectorPrimitives } from 'noya-inspector';
import { isDeepEqual } from 'noya-utils';
import React, { memo, useCallback, useMemo } from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { DSLayoutTree } from '../../../dseditor/DSLayoutTree';
import { parseLayout } from '../../../dseditor/componentLayout';
import { createResolvedNode, unresolve } from '../../../dseditor/traversal';
import {
  NoyaComponent,
  NoyaNode,
  NoyaResolvedNode,
} from '../../../dseditor/types';
import { useAyonDispatch } from '../../state/ayonState';
import { CustomLayerData } from '../../types';
import { InspectorCarousel, InspectorCarouselItem } from './InspectorCarousel';

type Props = {
  selectedLayer: Sketch.CustomLayer<CustomLayerData>;
  highlightedPath?: string[];
  setHighlightedPath: (path: string[] | undefined) => void;
  setPreviewNode: (node: NoyaNode | undefined) => void;
};

export const ComponentLayoutInspector = memo(function ComponentLayoutInspector({
  selectedLayer,
  highlightedPath,
  setHighlightedPath,
  setPreviewNode,
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

  const handleGenerateSuggestions = useCallback(() => {
    client.generate.resetComponentLayouts(
      selectedLayer.name,
      selectedLayer.data.description ?? '',
    );
    client.generate.componentLayouts({
      name: selectedLayer.name,
      description: selectedLayer.data.description ?? '',
    });
  }, [client.generate, selectedLayer.data.description, selectedLayer.name]);

  const layout0 = useMemo(() => {
    if (!generatedLayout.layout || !generatedLayout.layout[0]) return;

    return generatedLayout.layout[0];
  }, [generatedLayout.layout]);

  const node = useMemo(() => {
    if (selectedLayer.data.node) return selectedLayer.data.node;

    if (layout0) {
      return parseLayout(layout0);
    }
  }, [layout0, selectedLayer.data.node]);

  const findComponent = useCallback((id: string): NoyaComponent | undefined => {
    return undefined;
  }, []);

  const carouselItems: InspectorCarouselItem[] = useMemo(() => {
    if (!generatedLayout.layout) return [];

    return generatedLayout.layout.map((layout, index) => {
      const node = parseLayout(layout);

      return {
        id: index.toString(),
        size: selectedLayer.frame,
        data: {
          description: selectedLayer.data.description,
          node,
        },
      };
    });
  }, [
    generatedLayout.layout,
    selectedLayer.data.description,
    selectedLayer.frame,
  ]);

  const selectedIndex = useMemo(() => {
    if (!node) return;

    return carouselItems.findIndex((item) => isDeepEqual(item.data.node, node));
  }, [carouselItems, node]);

  const resolvedNode = useMemo(() => {
    if (!node) return;

    return createResolvedNode(findComponent, node);
  }, [findComponent, node]);

  const handleChange = useCallback(
    (newResolvedNode: NoyaResolvedNode) => {
      if (!node) return;

      const newNode = unresolve(newResolvedNode);

      dispatch('setLayerNode', selectedLayer.do_objectID, newNode);
    },
    [dispatch, node, selectedLayer.do_objectID],
  );

  return (
    <InspectorSection
      title="Layout"
      titleTextStyle="heading4"
      right={
        generatedLayout.loading.includes(true) ? (
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
      {node && selectedLayer.data.description && (
        <>
          <InspectorPrimitives.SectionHeader>
            <InspectorPrimitives.Title>
              Suggested Layouts
            </InspectorPrimitives.Title>
          </InspectorPrimitives.SectionHeader>
          {carouselItems.length > 0 ? (
            <InspectorCarousel
              items={carouselItems}
              selectedIndex={selectedIndex}
              onSelectItem={(index) => {
                const item = carouselItems[index];
                dispatch(
                  'setLayerNode',
                  selectedLayer.do_objectID,
                  item.data.node,
                );
              }}
              onHoverItemChange={(index, isHovering) => {
                if (isHovering) {
                  const item = carouselItems[index];
                  setPreviewNode(item.data.node);
                } else {
                  setPreviewNode(undefined);
                }
              }}
            />
          ) : (
            <Button onClick={handleGenerateSuggestions}>
              Generate Suggestions
            </Button>
          )}
        </>
      )}
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Current Layout</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      {resolvedNode && resolvedNode.type !== 'noyaString' ? (
        <DSLayoutTree
          resolvedNode={resolvedNode}
          onChange={handleChange}
          findComponent={findComponent}
          highlightedPath={highlightedPath}
          setHighlightedPath={setHighlightedPath}
        />
      ) : null}
    </InspectorSection>
  );
});
