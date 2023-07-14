import { GridView, Stack } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import React from 'react';
import {
  BlockPreviewProps,
  InteractiveBlockPreview,
} from '../../../docs/InteractiveBlockPreview';

export function InspectorCarousel({
  items,
  onSelectItem,
  onHoverItemChange,
  selectedIndex,
  getSymbolMaster,
}: {
  items: BlockPreviewProps[];
  onSelectItem: (index: number) => void;
  onHoverItemChange?: (index: number, isHovering: boolean) => void;
  selectedIndex?: number;
  getSymbolMaster: (symbolId: string) => Sketch.SymbolMaster;
}) {
  return (
    <GridView.Root scrollable={false} size="xs" textPosition="overlay" bordered>
      <GridView.Section padding={0}>
        {items.map((props, index) => (
          <GridView.Item
            key={index}
            id={props.symbolId}
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
              // This color sets the component text, so that it doesn't default
              // to what GridView sets it to. This should be coming from Chakra
              color="black"
            >
              <InteractiveBlockPreview
                key={props.symbolId}
                height="100%"
                width="100%"
                viewType="previewOnly"
                getSymbolMaster={getSymbolMaster}
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
