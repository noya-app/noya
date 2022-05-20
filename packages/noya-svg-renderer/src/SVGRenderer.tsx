import React, { memo, ReactNode, useMemo, useRef } from 'react';

import { Rect as CKRect } from 'canvaskit';
import type { CanvasKit, Paint, IPath } from 'canvaskit-types';
import { AffineTransform, Size } from 'noya-geometry';
import { ClipProps } from 'noya-react-canvaskit';
import {
  ComponentsContextValue,
  ComponentsProvider,
  useCanvasKit,
} from 'noya-renderer';
import { Base64, detectFileType, getFileExtensionForType } from 'noya-utils';
import { ElementIdProvider, useGetNextElementId } from './ElementIdContext';

const stringifyAffineTransform = (matrix: AffineTransform) => {
  const values = [
    matrix.m00,
    matrix.m10,
    matrix.m01,
    matrix.m11,
    matrix.m02,
    matrix.m12,
  ];

  return `matrix(${values.join(',')})`;
};

const stringifyColor = (color: Iterable<number>) => {
  const [r, g, b, a] = color;

  // Format a precision of 4 then parse again as a number to trim trailing 0s
  // and remove any exponentially formatted numbers
  const components = [r, g, b].map(
    (c) => Number((c * 100).toPrecision(4)) + '%',
  );

  if (a !== 1) {
    return `rgba(${components.join(', ')}, ${a})`;
  } else {
    return `rgb(${components.join(', ')})`;
  }
};

function usePaintProps(paint: Paint): React.SVGProps<any> {
  const CanvasKit = useCanvasKit();
  const color = stringifyColor(CanvasKit.getColorComponents(paint.getColor()));

  if (paint.style === CanvasKit.PaintStyle.Stroke) {
    return {
      stroke: color,
      strokeWidth: paint.getStrokeWidth(),
      fill: 'none',
    };
  }

  return {
    fill: color,
  };
}

function getRectProps(rect: Float32Array) {
  const [minX, minY, maxX, maxY] = rect;

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

const Rect: ComponentsContextValue['Rect'] = memo(({ rect, paint }) => {
  return (
    <rect
      {...usePaintProps(paint as unknown as Paint)}
      {...getRectProps(rect as unknown as CKRect)}
    />
  );
});

const Polyline: ComponentsContextValue['Polyline'] = memo(
  ({ points, paint }) => {
    const pointsString = points.map(({ x, y }) => `${x},${y}`).join(' ');

    return (
      <polyline
        points={pointsString}
        {...usePaintProps(paint as unknown as Paint)}
      />
    );
  },
);

const Path: ComponentsContextValue['Path'] = memo(({ path, paint }) => {
  const CanvasKit = useCanvasKit() as unknown as CanvasKit;

  return (
    <path
      d={path.toSVGString()}
      fillRule={
        path.getFillType() === CanvasKit.FillType.EvenOdd
          ? 'evenodd'
          : 'nonzero'
      }
      {...usePaintProps(paint as unknown as Paint)}
    />
  );
});

const Text: ComponentsContextValue['Text'] = memo(({ rect, paragraph }) => {
  // const rectProps = getRectProps(rect);

  // const transform = useMemo(() => {
  //   const affineTransform = AffineTransform.translation(
  //     rectProps.x,
  //     rectProps.y,
  //   );
  //   return stringifyAffineTransform(affineTransform);
  // }, [rectProps.x, rectProps.y]);

  return null;

  // const shapedLines = useMemo(() => paragraph.getShapedLines(), [paragraph]);

  // return (
  //   <g transform={transform}>
  //     {shapedLines.map((shapedLine, s) =>
  //       shapedLine.runs.map((run, r) => {
  //         const positions: Point[] = [];

  //         run.positions.forEach((value, index) => {
  //           if (index % 2 === 0) {
  //             positions.push({ x: value, y: 0 });
  //           } else {
  //             positions[positions.length - 1].y = value;
  //           }
  //         });

  //         const strings = [...run.glyphs].map(
  //           (value) => String.fromCharCode(value + 28), // TODO: Lookup by glyph id
  //         );

  //         const info = zip(positions, strings);

  //         return info.map(([position, string], i) => (
  //           <text
  //             fontSize={12}
  //             fill="white"
  //             key={`${s}-${r}-${i}`}
  //             x={position.x}
  //             y={shapedLine.top + position.y}
  //           >
  //             {string}
  //           </text>
  //         ));
  //       }),
  //     )}
  //   </g>
  // );
});

const ClipPath = memo(
  ({
    clip,
    children,
  }: {
    clip: ClipProps;
    children: (url: string) => ReactNode;
  }) => {
    const { path } = clip;
    const getNextId = useGetNextElementId();
    const id = useMemo(() => getNextId('clip-'), [getNextId]);

    return (
      <>
        <clipPath id={id}>
          {path instanceof Float32Array ? (
            <rect {...getRectProps(path)} />
          ) : (
            <path d={(path as unknown as IPath<CKRect>).toSVGString()} />
          )}
        </clipPath>
        {children(`url(#${id})`)}
      </>
    );
  },
);

const Group: ComponentsContextValue['Group'] = memo(
  ({ opacity, transform, children, clip, colorFilter, imageFilter }) => {
    const groupProps = {
      opacity,
      transform: transform ? stringifyAffineTransform(transform) : undefined,
      children,
    };

    if (clip) {
      return (
        <ClipPath clip={clip}>
          {(url) => <g {...groupProps} clipPath={url} />}
        </ClipPath>
      );
    }

    return <g {...groupProps} />;
  },
);

const Image: ComponentsContextValue['Image'] = memo(
  ({ rect, paint, image }) => {
    const encodedImage = useMemo(() => {
      const fileType = detectFileType(image);

      if (!fileType) return;

      return `data:${getFileExtensionForType(fileType)};base64,${Base64.encode(
        image,
      )}`;
    }, [image]);

    return (
      <image {...getRectProps(rect as unknown as CKRect)} href={encodedImage} />
    );
  },
);

const SVGComponents = {
  Rect,
  Polyline,
  Path,
  Text,
  Group,
  Image,
};

interface Props {
  size: Size;
  children: ReactNode;
  idPrefix?: string;
}

let svgId = 0;
const getNextSvgPrefix = () => `svg-${++svgId}-`;

export default memo(function SVGRenderer({ size, children, idPrefix }: Props) {
  const prefix = useRef(idPrefix ?? getNextSvgPrefix()).current;

  return (
    <ElementIdProvider prefix={prefix}>
      <svg
        width={size.width}
        height={size.height}
        xmlns="http://www.w3.org/2000/svg"
      >
        <ComponentsProvider value={SVGComponents}>
          {children}
        </ComponentsProvider>
      </svg>
    </ElementIdProvider>
  );
});
