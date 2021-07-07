import { Paint } from 'canvaskit';
import { AffineTransform, Size } from 'noya-geometry';
import { ClipProps } from 'noya-react-canvaskit';
import {
  ComponentsContextValue,
  ComponentsProvider,
  useCanvasKit,
} from 'noya-renderer';
import { Base64, detectFileType, getFileExtensionForType } from 'noya-utils';
import {
  createContext,
  Fragment,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import styled from 'styled-components';

type Definitions = Record<string, ReactNode>;

export type DefinitionsContextValue = {
  definitions: Definitions;
  addDefinition: (key: string, value: ReactNode) => void;
  removeDefinition: (key: string) => void;
};

const DefinitionsContext = createContext<DefinitionsContextValue | undefined>(
  undefined,
);

export const DefinitionsProvider = ({ children }: { children: ReactNode }) => {
  const [definitions, setDefinitions] = useState<Definitions>({});

  const addDefinition = useCallback((key: string, value: ReactNode) => {
    setDefinitions((definitions) => ({ ...definitions, [key]: value }));
  }, []);

  const removeDefinition = useCallback(
    (key: string) => setDefinitions(({ [key]: _, ...rest }) => rest),
    [],
  );

  const contextValue = useMemo(
    () => ({ definitions, addDefinition, removeDefinition } as const),
    [definitions, addDefinition, removeDefinition],
  );

  return (
    <DefinitionsContext.Provider value={contextValue}>
      <defs>
        {Object.entries(definitions).map(([key, value]) => (
          <Fragment key={key}>{value}</Fragment>
        ))}
      </defs>
      {children}
    </DefinitionsContext.Provider>
  );
};

export function useDefinitions(): DefinitionsContextValue {
  const value = useContext(DefinitionsContext);

  if (!value) {
    throw new Error('Missing DefinitionsProvider');
  }

  return value;
}

const SVGComponent = styled.svg(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  zIndex: -1,
}));

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
  return `rgba(${r * 100}%, ${g * 100}%, ${b * 100}%, ${a})`;
};

function usePaintProps(paint: Paint): React.SVGProps<any> {
  const CanvasKit = useCanvasKit();
  const color = stringifyColor(paint.getColor());

  if (paint.style === CanvasKit.PaintStyle.Stroke) {
    return {
      stroke: color,
      strokeWidth: paint.getStrokeWidth(),
      fill: 'none',
    };
  }

  return {
    fill: color,
    stroke: 'none',
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
  return <rect {...usePaintProps(paint)} {...getRectProps(rect)} />;
});

const Polyline: ComponentsContextValue['Polyline'] = memo(
  ({ points, paint }) => {
    const pointsString = points.map(({ x, y }) => `${x},${y}`).join(' ');

    return <polyline points={pointsString} {...usePaintProps(paint)} />;
  },
);

const Path: ComponentsContextValue['Path'] = memo(({ path, paint }) => {
  const CanvasKit = useCanvasKit();

  return (
    <path
      d={path.toSVGString()}
      fillRule={
        path.getFillType() === CanvasKit.FillType.EvenOdd
          ? 'evenodd'
          : 'nonzero'
      }
      {...usePaintProps(paint)}
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

let clipPathId = 0;
const getNextClipPathId = () => `${++clipPathId}`;

function useClipPath(id: string, path: ClipProps['path']) {
  const { addDefinition } = useDefinitions();

  const element = useMemo(() => {
    return (
      <clipPath id={id}>
        {path instanceof Float32Array ? (
          <rect {...getRectProps(path)} />
        ) : (
          <path d={path.toSVGString()} />
        )}
      </clipPath>
    );
  }, [id, path]);

  useLayoutEffect(() => {
    addDefinition(id, element);
  }, [addDefinition, element, id]);
}

const ClipPath = ({ id, path }: ClipProps & { id: string }) => {
  useClipPath(id, path);

  return null;
};

const Group: ComponentsContextValue['Group'] = memo(
  ({ opacity, transform, children, clip, colorFilter, imageFilter }) => {
    const clipPathId = useMemo(() => `clip-${getNextClipPathId()}`, []);

    return (
      <>
        {clip && <ClipPath id={clipPathId} {...clip} />}
        <g
          opacity={opacity}
          transform={
            transform ? stringifyAffineTransform(transform) : undefined
          }
          clipPath={clip ? `url(#${clipPathId})` : undefined}
        >
          {children}
        </g>
      </>
    );
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

    return <image {...getRectProps(rect)} href={encodedImage} />;
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
}

export default memo(function SVGRenderer({ size, children }: Props) {
  return (
    <SVGComponent
      width={size.width}
      height={size.height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <DefinitionsProvider>
        <ComponentsProvider value={SVGComponents}>
          {children}
        </ComponentsProvider>
      </DefinitionsProvider>
    </SVGComponent>
  );
});
