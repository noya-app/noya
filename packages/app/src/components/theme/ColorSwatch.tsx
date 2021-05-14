import Sketch from '@sketch-hq/sketch-file-format-ts';
import { sketchColorToRgbaString } from 'noya-designsystem';
import { Size } from 'noya-geometry';
import {
  Path,
  useColorFill,
  useDeletable,
  useReactCanvasKit,
} from 'noya-react-canvaskit';
import React, { memo, useMemo } from 'react';
import CanvasViewer from '../../containers/CanvasViewer';

const PREVIEW_SIZE = 60;

interface Props {
  value: Sketch.Color;
}

function RCKColorSwatch({ color, size }: { color: string; size: Size }) {
  const { CanvasKit } = useReactCanvasKit();
  const fill = useColorFill(color);

  const path = useMemo(() => {
    const path = new CanvasKit.Path();
    path.addOval(CanvasKit.XYWHRect(0, 0, size.width, size.height));
    return path;
  }, [CanvasKit, size]);

  useDeletable(path);

  return <Path path={path} paint={fill} />;
}

export default memo(function ColorSwatch({ value }: Props) {
  const colorString = useMemo(() => sketchColorToRgbaString(value), [value]);
  const size = useMemo(
    () => ({ width: PREVIEW_SIZE, height: PREVIEW_SIZE }),
    [],
  );

  return (
    <CanvasViewer
      width={size.width}
      height={size.height}
      renderContent={() => <RCKColorSwatch color={colorString} size={size} />}
    />
  );
});
