import Sketch from 'noya-file-format';
import { center, Size } from 'noya-geometry';
import { SketchLayer } from 'noya-renderer';
import { SketchModel } from 'noya-sketch-model';
import React, { memo, useMemo } from 'react';
import CanvasGridItem from './CanvasGridItem';

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

export default memo(function ThemeStyle({ style }: Props) {
  return (
    <CanvasGridItem
      renderContent={(size) => <RCKStylePreview style={style} size={size} />}
    />
  );
});
