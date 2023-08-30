import { useNoyaClient } from 'noya-api';
import {
  ActivityIndicator,
  Button,
  IconButton,
  Spacer,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { InspectorPrimitives } from 'noya-inspector';
import { isDeepEqual } from 'noya-utils';
import React, { memo, useCallback, useMemo } from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { DSLayoutTree } from '../../../dseditor/DSLayoutTree';
import { createResolvedNode, unresolve } from '../../../dseditor/traversal';
import {
  NoyaComponent,
  NoyaNode,
  NoyaResolvedNode,
} from '../../../dseditor/types';
import { useAyonDispatch } from '../../state/ayonState';
import { CustomLayerData } from '../../types';
import { useManagedLayout } from '../GeneratedLayoutContext';
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
  const generatedLayout = useManagedLayout(
    selectedLayer.name ?? '',
    selectedLayer.data.description ?? '',
  );
  const activeIndex = selectedLayer.data.activeGenerationIndex ?? 0;

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

  const node = selectedLayer.data.node ?? generatedLayout[activeIndex]?.node;

  const findComponent = useCallback((id: string): NoyaComponent | undefined => {
    return undefined;
  }, []);

  const carouselItems: InspectorCarouselItem[] = useMemo(() => {
    return generatedLayout.map((layout, index) => {
      return {
        id: index.toString(),
        size: selectedLayer.frame,
        data: {
          description: selectedLayer.data.description,
          node: layout.node,
        },
      };
    });
  }, [generatedLayout, selectedLayer.data.description, selectedLayer.frame]);

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

  const selectedIndex = useMemo(() => {
    if (!selectedLayer.data.node) return activeIndex;

    return carouselItems.findIndex((item) =>
      isDeepEqual(item.data.node, selectedLayer.data.node, {
        shouldIgnoreKey(key) {
          return key === 'id';
        },
      }),
    );
  }, [activeIndex, carouselItems, selectedLayer.data.node]);

  // if (selectedLayer.data.node) {
  //   console.log(
  //     activeIndex,
  //     selectedIndex,
  //     diff(carouselItems[activeIndex]?.data.node, selectedLayer.data.node),
  //   );
  // }
  // console.log(diff(carouselItems[selectedIndex]?.data.node, selectedLayer.data.node));

  return (
    <InspectorSection
      title="Layout"
      titleTextStyle="heading4"
      right={
        generatedLayout.some((layout) => layout.loading) ? (
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
                // If still loading, delete the node.
                // This handles the case where the user clicks on a layout that's loaded and
                // then clicks on a layout that's still loading.
                if (generatedLayout[index]?.loading) {
                  dispatch('batch', [
                    ['setLayerNode', selectedLayer.do_objectID, undefined],
                    [
                      'setLayerActiveGenerationIndex',
                      selectedLayer.do_objectID,
                      index,
                    ],
                  ]);
                } else {
                  const item = carouselItems[index];

                  dispatch('batch', [
                    ['setLayerNode', selectedLayer.do_objectID, item.data.node],
                    [
                      'setLayerActiveGenerationIndex',
                      selectedLayer.do_objectID,
                      index,
                    ],
                  ]);
                }
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
        <Spacer.Horizontal />
        {!selectedLayer.data.node && generatedLayout[activeIndex]?.loading && (
          <ActivityIndicator size={13} />
        )}
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
