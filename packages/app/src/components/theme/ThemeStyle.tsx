import Sketch from '@sketch-hq/sketch-file-format-ts';
import produce from 'immer';
import { center, Size } from 'noya-geometry';
import { uuid } from 'noya-renderer';
import SketchLayer from 'noya-renderer/src/components/layers/SketchLayer';
import { Models } from 'noya-state';
import React, { memo, useMemo } from 'react';
import CanvasGridItem from './CanvasGridItem';

interface Props {
  style: Sketch.Style;
}

const PREVIEW_SIZE = 60;

function RCKStylePreview({ style, size }: { style: Sketch.Style; size: Size }) {
  const layer = useMemo(() => {
    return produce(Models.rectangle, (draft) => {
      draft.do_objectID = uuid();
      draft.fixedRadius = 6;
      draft.frame = {
        ...draft.frame,
        ...center({ width: PREVIEW_SIZE, height: PREVIEW_SIZE }, size),
      };
      draft.style = style;
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
