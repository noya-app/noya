import {
  darkTheme,
  DesignSystemConfigurationProvider,
  GridView,
  Stack,
  useDesignSystemConfiguration,
} from 'noya-designsystem';
import { BlockCategory, blockMetadata } from '../ayon/blocks/blockMetadata';

import { useRouter } from 'next/router';
import React from 'react';
import { InteractiveBlockPreview } from './InteractiveBlockPreview';

export function BlockGrid({ category }: { category: BlockCategory }) {
  const { platform } = useDesignSystemConfiguration();
  const router = useRouter();

  return (
    <DesignSystemConfigurationProvider platform={platform} theme={darkTheme}>
      <GridView.Root onClick={() => {}} scrollable={false} variant="large">
        <GridView.Section padding={0}>
          {Object.entries(blockMetadata)
            .filter(([, metadata]) => metadata.category === category)
            .map(([blockId, metadata]) => (
              <GridView.Item
                key={blockId}
                id={blockId}
                title={metadata.name}
                onClick={() => {
                  router.push(
                    `/docs/blocks/${
                      category === 'element' ? 'elements' : category
                    }/${metadata.name
                      .toLocaleLowerCase()
                      .replaceAll(' ', '-')}`,
                  );
                }}
              >
                <Stack.V
                  width="100%"
                  height="100%"
                  // This color sets the component text, so that it doesn't default
                  // to what GridView sets it to. This should be coming from Chakra
                  color="black"
                >
                  <InteractiveBlockPreview
                    blockId={blockId}
                    height="100%"
                    viewType="previewOnly"
                  />
                  {/* Block pointer events */}
                  <Stack.V width="100%" height="100%" position="absolute" />
                </Stack.V>
              </GridView.Item>
            ))}
        </GridView.Section>
      </GridView.Root>
    </DesignSystemConfigurationProvider>
  );
}
