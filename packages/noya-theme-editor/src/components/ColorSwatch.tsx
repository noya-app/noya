import { CanvasViewer } from 'noya-canvas-preview';
import { sketchColorToRgbaString } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { Size } from 'noya-geometry';
import { useColorFill, useDeletable } from 'noya-react-canvaskit';
import { Path, useCanvasKit } from 'noya-renderer';
import React, { memo, useMemo } from 'react';

const PREVIEW_SIZE = 60;

interface Props {
  value: Sketch.Color;
}

function RCKColorSwatch({ color, size }: { color: string; size: Size }) {
  const CanvasKit = useCanvasKit();
  const fill = useColorFill(color);

  const path = useMemo(() => {
    const path = new CanvasKit.Path();
    path.addOval(CanvasKit.XYWHRect(0, 0, size.width, size.height));
    return path;
  }, [CanvasKit, size]);

  useDeletable(path);

  return <Path path={path} paint={fill} />;
}

export const ColorSwatch = memo(function ColorSwatch({ value }: Props) {
  const colorString = useMemo(() => sketchColorToRgbaString(value), [value]);
  const size = useMemo(
    () => ({ width: PREVIEW_SIZE, height: PREVIEW_SIZE }),
    [],
  );

  return (
    <CanvasViewer
      size={size}
      renderContent={() => <RCKColorSwatch color={colorString} size={size} />}
    />
  );
});
