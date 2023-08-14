import produce from 'immer';
import { StateProvider, useWorkspaceState } from 'noya-app-state-context';
import { GridView, Stack } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { Size } from 'noya-geometry';
import { SketchModel } from 'noya-sketch-model';
import { Layers } from 'noya-state';
import React from 'react';
import { useDS } from '../../../components/DSContext';
import { CustomLayerData } from '../../types';
import { DOMRenderer } from '../DOMRenderer';

export type InspectorCarouselItem = {
  id: string;
  name?: string;
  data: CustomLayerData;
  size: Size;
};

export function InspectorCarousel({
  items,
  onSelectItem,
  onHoverItemChange,
  selectedIndex,
}: {
  items: InspectorCarouselItem[];
  onSelectItem: (index: number) => void;
  onHoverItemChange?: (index: number, isHovering: boolean) => void;
  selectedIndex?: number;
}) {
  const state = useWorkspaceState();
  const ds = useDS();

  if (!ds) return null;

  return (
    <Stack.V flex="1">
      <GridView.Root
        scrollable={false}
        size="xs"
        textPosition="overlay"
        bordered
      >
        <GridView.Section padding={0}>
          {items.map((props, index) => {
            const customState = produce(state, (draft) => {
              const draftArtboard = Layers.find<Sketch.Artboard>(
                draft.history.present.sketch.pages[0],
                Layers.isArtboard,
              );

              if (!draftArtboard) return;

              draftArtboard.frame.width = props.size.width;
              draftArtboard.frame.height = props.size.height;

              draftArtboard.layers.length = 0;
              draftArtboard.layers.push(
                SketchModel.customLayer<CustomLayerData>({
                  frame: SketchModel.rect({
                    x: 0,
                    y: 0,
                    width: props.size.width,
                    height: props.size.height,
                  }),
                  data: props.data,
                }),
              );
            });

            return (
              <GridView.Item
                key={index}
                id={props.id}
                title={props.name ?? ''}
                onClick={() => {
                  onSelectItem(index);
                }}
                onHoverChange={(isHovering) => {
                  onHoverItemChange?.(index, isHovering);
                }}
                selected={index === selectedIndex}
              >
                <Stack.V
                  tabIndex={-1}
                  background={'white'}
                  width="100%"
                  height="100%"
                  color="black"
                >
                  <StateProvider state={customState}>
                    <DOMRenderer
                      resizeBehavior={'fit-container'}
                      ds={ds}
                      sync={false}
                      padding={0}
                    />
                  </StateProvider>
                  {/* Block pointer events */}
                  <Stack.V width="100%" height="100%" position="absolute" />
                </Stack.V>
              </GridView.Item>
            );
          })}
        </GridView.Section>
      </GridView.Root>
    </Stack.V>
  );
}
