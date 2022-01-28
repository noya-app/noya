import React from 'react';

import * as CanvasKit from 'canvaskit';
import Sketch from 'noya-file-format';
import { AffineTransform, Rect } from 'noya-geometry';
import {
  ClipProps,
  PaintParameters,
  useColorFill,
  useDeletable,
  usePaint,
} from 'noya-react-canvaskit';
import { SketchModel } from 'noya-sketch-model';
import { getStrokedPath, Primitives } from 'noya-state';
// import { Group, Path, useCanvasKit } from 'noya-renderer';
import { useCanvasKit } from '../../hooks/useCanvasKit';
import { Group, Path } from '../../ComponentsContext';
import { memo, useEffect, useMemo, useState } from 'react';
// import { compileShader } from '../../hooks/useCompileShader';
import useLayerPath from '../../hooks/useLayerPath';
// import { useSketchImage } from '../../ImageCache';
// import { getUniformValues } from '../../shaders';
// import BlurGroup from '../effects/BlurGroup';
import SketchBorder from '../effects/SketchBorder';

/**
 * A clock that contains the current time, and updates every animation frame
 */
// function useClock({ enabled }: { enabled: boolean }) {
//   const [time, setTime] = useState(0);

//   useEffect(() => {
//     if (!enabled) return;

//     const id = requestAnimationFrame(() => {
//       setTime(performance.now());
//     });

//     return () => {
//       cancelAnimationFrame(id);
//     };
//   }, [enabled, time]);

//   return time;
// }

const SketchFill = memo(function SketchFill({
  path,
  fill,
  frame,
}: {
  path: CanvasKit.Path;
  fill: Sketch.Fill;
  frame: Rect;
}) {
  const CanvasKit = useCanvasKit();

  // const image = useSketchImage(fill.image);

  // TODO: Delete unused shaders
  const runtimeEffect = undefined;
  // useMemo(() => {
  // if (
  //   fill.fillType !== Sketch.FillType.Shader ||
  //   !fill.shader ||
  //   !fill.shader.shaderString
  // )
  //   return;

  // const compiled = compileShader(CanvasKit, fill.shader);

  // return compiled.type === 'ok' ? compiled.value : undefined;
  // }, [CanvasKit, fill.fillType, fill.shader]);

  // const time = useClock({
  //   enabled: fill.fillType === Sketch.FillType.Shader,
  // });

  // TODO: Delete internal gradient shaders on unmount
  const paint = useMemo(() => {
    // const uniforms =
    //   fill.shader && runtimeEffect
    //     ? getUniformValues([
    //         ...fill.shader.variables,
    //         SketchModel.shaderVariable({
    //           name: 'iTime',
    //           value: { type: 'float', data: time },
    //         }),
    //       ])
    //     : undefined;

    return Primitives.fill(
      CanvasKit,
      fill,
      frame,
      undefined, // image,
      runtimeEffect,
      [], // uniforms,
    );
  }, [CanvasKit, fill, frame, runtimeEffect]);
  //[CanvasKit, fill, frame, image, runtimeEffect, time]);

  useDeletable(paint);

  return <Path path={path} paint={paint} />;
});

// const SketchShadow = memo(function SketchShadow({
//   path,
//   shadow,
// }: {
//   path: CanvasKit.Path;
//   shadow: Sketch.Shadow;
// }) {
//   const CanvasKit = useCanvasKit();

//   const paintParameters: PaintParameters = useMemo(
//     () => ({
//       style: CanvasKit.PaintStyle.Fill,
//       color: Primitives.color(CanvasKit, shadow.color),
//       maskFilter: CanvasKit.MaskFilter.MakeBlur(
//         CanvasKit.BlurStyle.Normal,
//         shadow.blurRadius / 2, // Skia blurs seem twice as large as Sketch blurs
//         true,
//       ),
//     }),
//     [CanvasKit, shadow],
//   );
//   const paint = usePaint(paintParameters);

//   const transform = useMemo(
//     () => AffineTransform.translate(shadow.offsetX, shadow.offsetY),
//     [shadow.offsetX, shadow.offsetY],
//   );

//   return (
//     <Group transform={transform}>
//       <Path path={path} paint={paint} />
//     </Group>
//   );
// });

/**
 * This is a special case of layer shadow. If there are no fills but
 * at least one border, then we draw a shadow just for the border.
 */
// const SketchBorderShadow = memo(function SketchBorderShadow({
//   path,
//   shadow,
//   borderWidth,
//   borderPosition,
//   borderOptions,
// }: {
//   path: CanvasKit.Path;
//   shadow: Sketch.Shadow;
//   borderWidth: number;
//   borderPosition: Sketch.BorderPosition;
//   borderOptions: Sketch.BorderOptions;
// }) {
//   const CanvasKit = useCanvasKit();

//   const strokedPath = useMemo(
//     () =>
//       Primitives.getStrokedBorderPath(
//         CanvasKit,
//         path,
//         borderWidth,
//         borderPosition,
//         borderOptions.lineCapStyle,
//         borderOptions.lineJoinStyle,
//       ),
//     [
//       CanvasKit,
//       borderOptions.lineCapStyle,
//       borderOptions.lineJoinStyle,
//       borderPosition,
//       borderWidth,
//       path,
//     ],
//   );

//   return <SketchShadow shadow={shadow} path={strokedPath} />;
// });

// const SketchFillShadow = memo(function SketchFillShadow({
//   path,
//   shadow,
//   borderWidth,
//   borderPosition,
//   borderOptions,
//   shouldClipPath,
// }: {
//   path: CanvasKit.Path;
//   shadow: Sketch.Shadow;
//   borderWidth: number;
//   borderPosition: Sketch.BorderPosition;
//   borderOptions: Sketch.BorderOptions;
//   shouldClipPath: boolean;
// }) {
//   const CanvasKit = useCanvasKit();

//   // Spread needs to be multiplied by 2 to match Sketch's behavior
//   const additionalRadius =
//     shadow.spread * 2 +
//     borderWidth *
//       (borderPosition === Sketch.BorderPosition.Outside
//         ? 2
//         : borderPosition === Sketch.BorderPosition.Center
//         ? 1
//         : 0);

//   // TODO: We can optimize this: if there's no spread, we don't need to copy the path.
//   // We currently need to copy the path since we use `useDeletable` after, and don't want
//   // to delete a path passed in as a prop.
//   const strokedPath: CanvasKit.Path = getStrokedPath(
//     CanvasKit,
//     path,
//     additionalRadius,
//     borderOptions.lineCapStyle,
//     borderOptions.lineJoinStyle,
//     CanvasKit.PathOp.Union,
//   );

//   useDeletable(strokedPath);

//   const clip: ClipProps | undefined = useMemo(
//     () =>
//       shouldClipPath
//         ? {
//             path: path,
//             op: CanvasKit.ClipOp.Difference,
//           }
//         : undefined,
//     [CanvasKit.ClipOp.Difference, path, shouldClipPath],
//   );

//   return (
//     <Group clip={clip}>
//       <SketchShadow shadow={shadow} path={strokedPath} />
//     </Group>
//   );
// });

// const SketchInnerShadow = memo(function SketchInnerShadow({
//   path,
//   innerShadow,
// }: {
//   path: CanvasKit.Path;
//   innerShadow: Sketch.InnerShadow;
// }) {
//   const CanvasKit = useCanvasKit();

//   const fillPaint = useColorFill(
//     Primitives.color(CanvasKit, innerShadow.color),
//   );

//   const imageFilter = useMemo(() => {
//     const erodeFilter = CanvasKit.ImageFilter.MakeErode(
//       innerShadow.spread,
//       innerShadow.spread,
//       null,
//     );

//     const blurFilter = CanvasKit.ImageFilter.MakeBlur(
//       innerShadow.blurRadius / 2,
//       innerShadow.blurRadius / 2,
//       CanvasKit.TileMode.Clamp,
//       erodeFilter,
//     );

//     const offsetFilter = CanvasKit.ImageFilter.MakeOffset(
//       innerShadow.offsetX,
//       innerShadow.offsetY,
//       blurFilter,
//     );

//     const arithmeticFilter = CanvasKit.ImageFilter.MakeArithmetic(
//       0,
//       -1,
//       1,
//       0,
//       false,
//       null,
//       offsetFilter,
//     );

//     return arithmeticFilter;
//   }, [
//     CanvasKit,
//     innerShadow.blurRadius,
//     innerShadow.offsetX,
//     innerShadow.offsetY,
//     innerShadow.spread,
//   ]);

//   return (
//     <Group imageFilter={imageFilter}>
//       <Path path={path} paint={fillPaint} />
//     </Group>
//   );
// });

interface Props {
  layer:
    | Sketch.Rectangle
    | Sketch.Oval
    | Sketch.Triangle
    | Sketch.Star
    | Sketch.Polygon
    | Sketch.ShapePath
    | Sketch.ShapeGroup;
}

export default memo(function SketchShape({ layer }: Props) {
  const path = useLayerPath(layer);

  const style = useMemo(
    () => layer.style ?? SketchModel.style(),
    [layer.style],
  );

  const fills = (style.fills ?? []).filter((x) => x.isEnabled);
  const borders = (style.borders ?? []).filter((x) => x.isEnabled);
  // const shadows = (style.shadows ?? []).filter((x) => x.isEnabled);
  // const innerShadows = (style.innerShadows ?? []).filter((x) => x.isEnabled);
  // const borderWidth = Math.max(0, ...borders.map((border) => border.thickness));
  // const borderPosition =
  //   borders.length > 0 ? borders[0].position : Sketch.BorderPosition.Inside;

  // {shadows.map((shadow, index) =>
  //   fills.length === 0 && borders.length > 0 ? (
  //     <SketchBorderShadow
  //       key={`shadow-${index}`}
  //       shadow={shadow}
  //       path={path}
  //       borderWidth={borderWidth}
  //       borderPosition={borderPosition}
  //       borderOptions={style.borderOptions}
  //     />
  //   ) : (
  //     <SketchFillShadow
  //       key={`shadow-${index}`}
  //       shadow={shadow}
  //       path={path}
  //       shouldClipPath={fills.length > 0}
  //       borderWidth={borderWidth}
  //       borderPosition={borderPosition}
  //       borderOptions={style.borderOptions}
  //     />
  //   ),
  // )}

  const elements = (
    <>
      {fills.map((fill, index) => (
        <SketchFill
          key={`fill-${index}`}
          fill={fill}
          path={path}
          frame={layer.frame}
        />
      ))}
      {/* {innerShadows.map((innerShadow, index) => (
        <SketchInnerShadow
          key={`innerShadow-${index}`}
          innerShadow={innerShadow}
          path={path}
        />
      ))} */}
      {borders.map((border, index) => (
        <SketchBorder
          key={`border-${index}`}
          path={path}
          border={border}
          frame={layer.frame}
          borderOptions={style.borderOptions}
        />
      ))}
    </>
  );

  const opacity = layer.style?.contextSettings?.opacity ?? 1;

  // const blur = useMemo(
  //   () => style.blur ?? SketchModel.blur({ isEnabled: false }),
  //   [style.blur],
  // );
  // <BlurGroup blur={blur} clippingPath={path}>
  /* </BlurGroup> */

  return opacity < 1 ? <Group opacity={opacity}>{elements}</Group> : elements;
});
