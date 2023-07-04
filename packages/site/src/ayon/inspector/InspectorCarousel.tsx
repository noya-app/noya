import { GridView, Stack } from 'noya-designsystem';
import React from 'react';

export function InspectorCarousel() {
  return (
    <GridView.Root
      onClick={() => {}}
      scrollable={false}
      size="xs"
      textPosition="overlay"
      bordered
    >
      <GridView.Section padding={0}>
        {[...Array(3)].map((_, index) => (
          <GridView.Item
            id="test"
            title={'Hello'}
            onClick={() => {}}
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
              {/* Block pointer events */}
              <Stack.V width="100%" height="100%" position="absolute" />
            </Stack.V>
          </GridView.Item>
        ))}
      </GridView.Section>
    </GridView.Root>
  );
}
