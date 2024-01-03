import { Sketch } from '@noya-app/noya-file-format';
import { center, Size } from '@noya-app/noya-geometry';
import { SketchModel } from '@noya-app/noya-sketch-model';
import { SketchLayer } from 'noya-renderer';
import React, { memo, useMemo } from 'react';
import { CanvasPreviewItem } from './CanvasPreviewItem';

interface Props {
  style: Sketch.Style;
}

const PREVIEW_SIZE = 60;

function RCKStylePreview({ style, size }: { style: Sketch.Style; size: Size }) {
  const layer = useMemo(() => {
    return SketchModel.rectangle({
      fixedRadius: 6,
      frame: SketchModel.rect(
        center({ width: PREVIEW_SIZE, height: PREVIEW_SIZE }, size),
      ),
      style,
    });
  }, [style, size]);

  return <SketchLayer layer={layer} />;
}

export const ThemeStyle = memo(function ThemeStyle({ style }: Props) {
  return (
    <CanvasPreviewItem
      renderContent={(size) => <RCKStylePreview style={style} size={size} />}
    />
  );
});
