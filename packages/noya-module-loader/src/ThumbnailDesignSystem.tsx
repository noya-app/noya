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

const TextComponent = (props: any, { color }: { color: string }) => {
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

      return (
        <span
          style={{
            ...props.style,
            fontFamily: 'sans-serif',
            fontSize,
            color: 'rgb(48,58,71)',
          }}
        >
          {child}
        </span>
      );
    }

    return (
      <div style={props.style}>
        <span
          style={{
            display: 'inline-block',
            background: color,
            // background: 'currentColor',
            borderRadius: tokens.borderRadius,
            height: '12px',
            lineHeight: '12px',
          }}
        >
          <span style={{ color: 'transparent' }}>{child}</span>
        </span>
      </div>
    );
  }

  return <span {...applyCommonProps(props)} />;
};

const proxyObject = new Proxy(
  {
    [component.id.Box]: (props: any) => {
      return (
        <div
          {...applyCommonProps(props)}
          style={{
            borderColor: 'rgb(221,221,221)',
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
            background: theme?.colors.primary[500],
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
              background: 'white',
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
    [component.id.Text]: (props: any) =>
      TextComponent(props, { color: '#ccc' }),
    [component.id.Link]: (props: any) => {
      const theme = getTheme(props);

      return TextComponent(props, {
        color: theme?.colors.primary[500] || '#ccc',
      });
    },
    [component.id.Tag]: (props: any) => {
      const theme = getTheme(props);

      return TextComponent(props, {
        color: theme?.colors.primary[200] || '#ccc',
      });
    },
    [component.id.Input]: (props: any) => {
      return (
        <input
          {...applyCommonProps(props)}
          style={{
            appearance: 'none',
            ...props.style,
            background: 'white',
            border: '4px solid rgb(221,221,221)',
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
