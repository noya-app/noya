import {
  DesignSystemDefinition,
  Theme,
  applyCommonProps,
  component,
  x,
} from '@noya-design-system/protocol';
import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom';

const handler = {
  get(target: any, property: string | symbol): any {
    if (property in target) return target[property];

    return (props: any) => {
      return <div {...applyCommonProps(props)} />;
    };
  },
};

function getTheme(props: any) {
  if (props._theme) return props._theme as Theme;

  return undefined;
}

/**
 * This returns the wrapper span around the string child
 */
function getStringChild(props: any): ReactElement | undefined {
  if (
    props.children &&
    Array.isArray(props.children) &&
    props.children.length === 1 &&
    props.children[0].key === 'editable-span'
  ) {
    return props.children[0];
  }

  return undefined;
}

const tokens = {
  borderRadius: '16px',
};

const TextComponent = (
  props: any,
  {
    color,
    titleColor,
    opacity,
  }: { color: string; titleColor: string; opacity?: number },
) => {
  const child = getStringChild(props);

  if (child) {
    const hasTitleVariant =
      'variant' in props &&
      typeof props.variant === 'string' &&
      /^(h1|h2|h3)/.test(props.variant);

    if (hasTitleVariant) {
      const fontSize =
        props.variant === 'h1'
          ? '48px'
          : props.variant === 'h2'
          ? '40px'
          : '32px';

      const childWithStyle = React.cloneElement(child, {
        style: {
          color: props.style?.color ?? titleColor,
        },
      });

      return (
        <span
          style={{
            ...props.style,
            fontFamily: 'sans-serif',
            fontSize,
            color: titleColor,
          }}
        >
          {childWithStyle}
        </span>
      );
    }

    const stringValue: string | undefined =
      typeof child.props.children === 'string'
        ? child.props.children
        : undefined;

    function renderInlineBlock(
      value: React.ReactNode,
      index: number = 0,
      list: React.ReactNode[] = [],
    ) {
      return (
        <span
          key={index}
          style={{
            display: 'inline-block',
            background: props.style?.color ?? color,
            borderRadius: tokens.borderRadius,
            height: '12px',
            lineHeight: '12px',
            opacity: opacity ?? undefined,
            marginRight:
              list.length > 0 && index === list.length - 1 ? undefined : '6px',
          }}
        >
          <span style={{ color: 'transparent' }}>{value}</span>
        </span>
      );
    }

    // TODO: We could consider not limiting the number of chunks here and instead
    // have a configurable limit for a given thumbnail
    return (
      <div
        style={{
          ...props.style,
          background: 'transparent',
          backgroundColor: 'transparent',
        }}
      >
        {stringValue && stringValue.length > 80
          ? splitStringIntoRandomChunks(stringValue, 8, 36)
              .slice(0, 8)
              .map(renderInlineBlock)
          : renderInlineBlock(child)}
      </div>
    );
  }

  return <span {...applyCommonProps(props)} />;
};

const proxyObject = new Proxy(
  {
    [component.id.Box]: (props: any) => {
      const theme = getTheme(props);

      return (
        <div
          {...applyCommonProps(props)}
          style={{
            borderColor:
              theme?.colorMode === 'light' ? 'rgb(221,221,221)' : '#222',
            ...props.style,
          }}
        />
      );
    },
    [component.id.Card]: (props: any) => {
      return (
        <div
          {...applyCommonProps(props)}
          style={{
            ...props.style,
            borderRadius: tokens.borderRadius,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            padding: '16px',
          }}
        />
      );
    },
    [component.id.Button]: (props: any) => {
      const theme = getTheme(props);

      return (
        <button
          {...applyCommonProps(props)}
          style={{
            appearance: 'none',
            ...props.style,
            background: props.style.backgroundColor
              ? props.style.backgroundColor
              : theme?.colors.primary[500],
            height: '64px',
            borderRadius: tokens.borderRadius,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
          }}
        >
          <span
            style={{
              ...props.style,
              background: props.style?.color ?? 'white',
              borderRadius: tokens.borderRadius,
              height: '8px',
              minWidth: '33%',
              maxWidth: '66%',
              display: 'inline-block',
            }}
          >
            <span style={{ color: 'transparent', fontSize: '32px' }}>
              {props.children}
            </span>
          </span>
        </button>
      );
    },
    [component.id.Text]: (props: any) => {
      const theme = getTheme(props);
      const colorMode = theme?.colorMode || 'light';
      return TextComponent(props, {
        color: colorMode === 'light' ? '#ccc' : '#333',
        titleColor: colorMode === 'light' ? 'rgb(48,58,71)' : '#fff',
      });
    },
    [component.id.Link]: (props: any) => {
      const theme = getTheme(props);

      return TextComponent(props, {
        color: theme?.colors.primary[500] || '#ccc',
        titleColor: theme?.colors.primary[500] || '#ccc',
      });
    },
    [component.id.Tag]: (props: any) => {
      const theme = getTheme(props);

      return TextComponent(props, {
        color: theme?.colors.primary[500] || '#ccc',
        titleColor: theme?.colors.primary[500] || '#ccc',
        opacity: 0.3,
      });
    },
    [component.id.Input]: (props: any) => {
      const theme = getTheme(props);

      return (
        <input
          {...applyCommonProps(props)}
          style={{
            appearance: 'none',
            ...props.style,
            background: theme?.colorMode === 'light' ? '#fff' : '#333',
            border:
              theme?.colorMode === 'light'
                ? '4px solid rgb(221,221,221)'
                : '4px solid #666',
            padding: '0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: tokens.borderRadius,
            height: '56px',
          }}
        />
      );
    },
    [component.id.Image]: (props: any) => {
      const theme = getTheme(props);

      return (
        <div
          {...applyCommonProps(props)}
          style={{
            ...props.style,
            ...(props.style.borderRadius && {
              borderRadius: tokens.borderRadius,
            }),
            background: `linear-gradient(135deg, ${theme?.colors.primary[300]} 0%, ${theme?.colors.primary[500]} 100%)`,
          }}
        />
      );
    },
    [component.id.Avatar]: (props: any) => {
      const theme = getTheme(props);

      return (
        <div
          {...applyCommonProps(props)}
          style={{
            ...props.style,
            borderRadius: '1000px',
            background: theme?.colors.primary[500],
          }}
        />
      );
    },
    [component.id.Provider]: undefined,
  },
  handler,
);

export const ThumbnailDesignSystem: DesignSystemDefinition = {
  version: '',
  protocolVersion: '',
  components: proxyObject,
  themeTransformer: x.a('theme'),
  createElement: React.createElement,
  createRoot: (element: HTMLElement) => {
    return {
      render(node, options) {
        ReactDOM.render(node as React.ReactElement, element);
      },
      unmount() {
        ReactDOM.unmountComponentAtNode(element);
      },
    };
  },
  buildType: 'react',
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function simplePRNG(seed: number): () => number {
  return () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

function splitStringIntoRandomChunks(
  input: string,
  minChunk: number,
  maxChunk: number,
): string[] {
  const seed = simpleHash(input);
  const rand = simplePRNG(seed);
  let currentIndex = 0;
  const chunks: string[] = [];

  while (currentIndex < input.length) {
    let remaining = input.length - currentIndex;
    let chunkSize = minChunk + Math.floor(rand() * (maxChunk - minChunk + 1));

    // Adjust chunk size to avoid too small last chunk
    if (remaining - chunkSize < minChunk && remaining > chunkSize) {
      chunkSize = remaining - minChunk;
    }

    const chunk = input.substring(currentIndex, currentIndex + chunkSize);
    chunks.push(chunk);
    currentIndex += chunkSize;
  }

  return chunks;
}
