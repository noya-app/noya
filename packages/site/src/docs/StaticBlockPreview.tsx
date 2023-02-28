import { ChakraProvider } from '@chakra-ui/react';
import { Stack } from 'noya-designsystem';
import { SketchModel } from 'noya-sketch-model';
import { BlockDefinition } from 'noya-state';
import React, { useEffect, useState } from 'react';

const Blocks = import('../ayon/blocks/blocks');

export function BlockPreview({
  symbolId,
  blockText,
  width,
  height,
  getBlock,
}: {
  symbolId: string;
  blockText: string;
  width: number;
  height: number;
  getBlock: (symbolId: string) => BlockDefinition;
}) {
  const layer = SketchModel.symbolInstance({
    symbolID: symbolId,
    blockText,
    frame: SketchModel.rect({
      width,
      height,
    }),
  });

  const rendered = getBlock(symbolId).render({
    layer,
    symbolId,
    frame: layer.frame,
    blockText: layer.blockText,
    resolvedBlockData: layer.resolvedBlockData,
    getBlock,
  });

  return <ChakraProvider>{rendered}</ChakraProvider>;
}

export function StaticBlockPreview({ blockId }: { blockId: string }) {
  const [blocks, setBlocks] = useState<
    Record<string, BlockDefinition> | undefined
  >();

  useEffect(() => {
    if (!blockId) return;

    Blocks.then((m) => {
      const blocks = m.Blocks;

      setBlocks(blocks);
    });
  }, [blockId]);

  if (!blocks) return null;

  const block = blocks[blockId];

  return (
    <Stack.V
      alignItems={'center'}
      justifyContent="center"
      padding={20}
      background="linear-gradient(90deg, #eee 9px, transparent 1%) center, linear-gradient(#eee 9px, transparent 1%) center, #aaa; background-size: 10px 10px"
      borderRadius={4}
    >
      <Stack.V background="white">
        <BlockPreview
          blockText=""
          height={400}
          width={600}
          getBlock={(symbolId: string) => blocks[symbolId]}
          symbolId={block.symbol.symbolID}
        />
      </Stack.V>
    </Stack.V>
  );
}
