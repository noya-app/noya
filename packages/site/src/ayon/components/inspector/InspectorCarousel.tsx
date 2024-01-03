import { GridView, Stack } from '@noya-app/noya-designsystem';
import { Size } from '@noya-app/noya-geometry';
import { StateProvider } from 'noya-app-state-context';
import { SketchModel } from 'noya-sketch-model';
import { createInitialWorkspaceState, createSketchFile } from 'noya-state';
import React, { memo, useMemo } from 'react';
import { useDS } from '../../../components/DSContext';
import { CustomLayerData } from '../../types';
import { DOMRenderer } from '../DOMRenderer';

function createPreviewWorkspaceState(item: InspectorCarouselItem) {
  return createInitialWorkspaceState(
    createSketchFile(
      SketchModel.page({
        layers: [
          SketchModel.artboard({
            frame: SketchModel.rect({
              width: item.size.width,
              height: item.size.height,
            }),
            layers: [
              SketchModel.customLayer<CustomLayerData>({
                frame: SketchModel.rect({
                  x: 0,
                  y: 0,
                  width: item.size.width,
                  height: item.size.height,
                }),
                data: item.data,
              }),
            ],
          }),
        ],
      }),
    ),
  );
}

const CarouselItemComponent = memo(function CarouselItemComponent({
  index,
  item,
  onSelectItem,
  onHoverItemChange,
  selectedIndex,
}: {
  index: number;
  item: InspectorCarouselItem;
  onSelectItem: (index: number) => void;
  onHoverItemChange?: (index: number, isHovering: boolean) => void;
  selectedIndex?: number;
}) {
  const customState = useMemo(() => createPreviewWorkspaceState(item), [item]);
  const ds = useDS();

  if (!ds) return null;

  return (
    <GridView.Item
      key={index}
      id={item.id}
      subtitle={item.subtitle}
      loading={item.loading}
      onPress={() => {
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
        aspectRatio="1"
        color="black"
      >
        <StateProvider state={customState}>
          <DOMRenderer
            resizeBehavior={'fit-container'}
            ds={ds}
            sync={false}
            padding={0}
            renderingMode="static"
          />
        </StateProvider>
        {/* Block pointer events */}
        <Stack.V width="100%" height="100%" position="absolute" />
      </Stack.V>
    </GridView.Item>
  );
});

export type InspectorCarouselItem = {
  id: string;
  name?: string;
  data: CustomLayerData;
  size: Size;
  subtitle?: string;
  loading: boolean;
};

export const InspectorCarousel = memo(function InspectorCarousel({
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
            return (
              <CarouselItemComponent
                key={index}
                index={index}
                item={props}
                onSelectItem={onSelectItem}
                onHoverItemChange={onHoverItemChange}
                selectedIndex={selectedIndex}
              />
            );
          })}
        </GridView.Section>
      </GridView.Root>
    </Stack.V>
  );
});
