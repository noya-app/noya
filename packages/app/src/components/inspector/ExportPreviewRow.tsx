import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import Sketch from '@sketch-hq/sketch-file-format-ts';
import { memo, useCallback } from 'react';
import * as InspectorPrimitives from '../inspector/InspectorPrimitives';
import CanvasGridItem from '../theme/CanvasGridItem';
import { RCKSymbolPreview } from '../theme/Symbol';

function createCheckerBackground(
  size: number,
  color1: string,
  color2: string = 'transparent',
) {
  const sizePx = `${size}px`;

  const backgrounds = [
    {
      position: '0 0',
      size: `calc(${sizePx} * 2) calc(${sizePx} * 2)`,
      image: `linear-gradient(45deg, ${color1} 25%, ${color2} 25%)`,
    },
    {
      position: `0 ${sizePx}`,
      size: `calc(${sizePx} * 2) calc(${sizePx} * 2)`,
      image: `linear-gradient(-45deg, ${color1} 25%, ${color2} 25%)`,
    },
    {
      position: `${sizePx} calc(${sizePx} * -1)`,
      size: `calc(${sizePx} * 2) calc(${sizePx} * 2)`,
      image: `linear-gradient(45deg, ${color2} 75%, ${color1} 75%)`,
    },
    {
      position: `calc(${sizePx} * -1) 0px`,
      size: `calc(${sizePx} * 2) calc(${sizePx} * 2)`,
      image: `linear-gradient(-45deg, ${color2} 75%, ${color1} 75%)`,
    },
  ];

  return backgrounds
    .map((item) => `${item.position} / ${item.size} ${item.image}`)
    .join(', ');
}

interface Props {
  layer: Sketch.SymbolMaster;
}

export default memo(function ExportPreviewRow({ layer }: Props) {
  return (
    <InspectorPrimitives.Section>
      <AspectRatio.Root>
        <CanvasGridItem
          background={createCheckerBackground(7, 'rgba(255,255,255,0.1)')}
          renderContent={useCallback(
            (size) => (
              <RCKSymbolPreview layer={layer} size={size} />
            ),
            [layer],
          )}
        />
      </AspectRatio.Root>
    </InspectorPrimitives.Section>
  );
});
