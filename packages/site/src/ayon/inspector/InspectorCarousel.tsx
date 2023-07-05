import { GridView, Stack } from 'noya-designsystem';
import React from 'react';
import {
  BlockPreviewProps,
  InteractiveBlockPreview,
} from '../../docs/InteractiveBlockPreview';
import { Blocks } from '../blocks/blocks';

export function InspectorCarousel({
  items,
  onSelectItem,
  onHoverItemChange,
}: {
  items: BlockPreviewProps[];
  onSelectItem: (index: number) => void;
  onHoverItemChange?: (index: number, isHovering: boolean) => void;
}) {
  return (
    <GridView.Root scrollable={false} size="xs" textPosition="overlay" bordered>
      <GridView.Section padding={0}>
        {items.map((props, index) => (
          <GridView.Item
            key={index}
            id={props.blockId}
            title={Blocks[props.blockId].symbol.name}
            onClick={() => {
              onSelectItem(index);
            }}
            onHoverChange={(isHovering) => {
              onHoverItemChange?.(index, isHovering);
            }}
            selected={index === 0}
          >
            <Stack.V
              background={'white'}
              width="100%"
              height="100%"
              // This color sets the component text, so that it doesn't default
              // to what GridView sets it to. This should be coming from Chakra
              color="black"
            >
              <InteractiveBlockPreview
                key={props.blockId}
                height="100%"
                width="100%"
                viewType="previewOnly"
                {...props}
              />
              {/* Block pointer events */}
              <Stack.V width="100%" height="100%" position="absolute" />
            </Stack.V>
          </GridView.Item>
        ))}
      </GridView.Section>
    </GridView.Root>
  );
}
