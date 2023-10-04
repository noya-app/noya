import { useNoyaClient } from 'noya-api';
import { Button, Spacer, lightTheme } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { InspectorPrimitives } from 'noya-inspector';
import { isDeepEqual } from 'noya-utils';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { InspectorSection } from '../../../components/InspectorSection';
import { NoyaNode } from '../../../dseditor/types';
import { useCurrentGeneratedLayout } from '../../hooks/useCurrentGeneratedLayout';
import { useAyonDispatch } from '../../state/ayonState';
import { CustomLayerData } from '../../types';
import { InspectorCarousel, InspectorCarouselItem } from './InspectorCarousel';

type Props = {
  selectedLayer: Sketch.CustomLayer<CustomLayerData>;
  setPreviewNode: (node: NoyaNode | undefined) => void;
};

export const ComponentLayoutInspector = memo(function ComponentLayoutInspector({
  selectedLayer,
  setPreviewNode,
}: Props) {
  const dispatch = useAyonDispatch();
  const client = useNoyaClient();

  const { generatedLayout, activeIndex, node } =
    useCurrentGeneratedLayout(selectedLayer);

  const handleGenerateSuggestions = useCallback(() => {
    client.generate.resetComponentLayouts(
      selectedLayer.name,
      selectedLayer.data.description ?? '',
    );
    client.generate.componentLayouts({
      name: selectedLayer.name,
      description: selectedLayer.data.description ?? '',
      imageGenerator: selectedLayer.data.preferredImageGenerator ?? 'geometric',
    });
  }, [
    client.generate,
    selectedLayer.data.description,
    selectedLayer.data.preferredImageGenerator,
    selectedLayer.name,
  ]);

  const carouselItems = useMemo(() => {
    return generatedLayout.map((layout, index): InspectorCarouselItem => {
      return {
        id: index.toString(),
        size: {
          width: selectedLayer.frame.width,
          height: selectedLayer.frame.height,
        },
        data: {
          description: selectedLayer.data.description,
          node: layout.node,
        },
        subtitle: layout.provider,
        loading: layout.loading,
      };
    });
  }, [
    generatedLayout,
    selectedLayer.data.description,
    selectedLayer.frame.width,
    selectedLayer.frame.height,
  ]);

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

  // If there's a name and description and layout generation source,
  // but no generated layouts, generate them
  useEffect(() => {
    if (
      generatedLayout.length === 0 &&
      selectedLayer.name &&
      selectedLayer.data.description &&
      selectedLayer.data.layoutGenerationSource &&
      isDeepEqual(
        {
          name: selectedLayer.name,
          description: selectedLayer.data.description,
        },
        selectedLayer.data.layoutGenerationSource,
      )
    ) {
      client.generate.componentLayouts({
        name: selectedLayer.name,
        description: selectedLayer.data.description ?? '',
        imageGenerator:
          selectedLayer.data.preferredImageGenerator ?? 'geometric',
      });
    }
  }, [
    client,
    generatedLayout.length,
    selectedLayer.data.description,
    selectedLayer.data.layoutGenerationSource,
    selectedLayer.data.preferredImageGenerator,
    selectedLayer.name,
  ]);

  const isGeneratingLayouts = generatedLayout.some((layout) => layout.loading);
  const seeMoreDisabled =
    !selectedLayer.data.description || isGeneratingLayouts;

  return (
    <InspectorSection title="UI Elements" titleTextStyle="heading4">
      {node && selectedLayer.data.description && (
        <>
          <InspectorPrimitives.SectionHeader>
            <InspectorPrimitives.Title>Suggestions</InspectorPrimitives.Title>
            <Spacer.Horizontal />
            <Button
              variant="none"
              onClick={handleGenerateSuggestions}
              disabled={seeMoreDisabled}
              contentStyle={{
                ...lightTheme.textStyles.label,
                color: seeMoreDisabled
                  ? undefined
                  : lightTheme.colors.secondary,
              }}
            >
              SEE MORE
            </Button>
          </InspectorPrimitives.SectionHeader>
          {carouselItems.length > 0 && (
            <InspectorCarousel
              items={carouselItems}
              selectedIndex={selectedIndex}
              onSelectItem={(index) => {
                // If still loading, delete the node.
                // This handles the case where the user clicks on a layout that's loaded and
                // then clicks on a layout that's still loading.
                if (generatedLayout[index]?.loading) {
                  dispatch('batch', [
                    [
                      'setLayerNode',
                      selectedLayer.do_objectID,
                      undefined,
                      'unset',
                    ],
                    [
                      'setLayerActiveGenerationIndex',
                      selectedLayer.do_objectID,
                      index,
                    ],
                  ]);
                } else {
                  const item = carouselItems[index];

                  dispatch('batch', [
                    [
                      'setLayerNode',
                      selectedLayer.do_objectID,
                      item.data.node,
                      {
                        name: selectedLayer.name,
                        description: selectedLayer.data.description || '',
                      },
                    ],
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
          )}
        </>
      )}
    </InspectorSection>
  );
});
