import React, { memo, PropsWithChildren } from 'react';
import * as RadixAspectRatio from '@radix-ui/react-aspect-ratio';

type AspectRatioProps = PropsWithChildren<{
  ratio: number;
}>;

function AspectRatio({ ratio, children }: AspectRatioProps) {
  return (
    <RadixAspectRatio.Root ratio={ratio}>{children}</RadixAspectRatio.Root>
  );
}

export default memo(AspectRatio);
