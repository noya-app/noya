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
  if (props._noya && props._noya.theme) return props._noya.theme as Theme;

  return undefined;
}

/**
 * This returns the wrapper span around the string child
 */
function getStringChild(props: any): ReactElement | undefined {
  if (props.children && React.Children.count(props.children) === 1) {
    const child = React.Children.only(props.children);

    if (child.key === 'editable-span') {
      return child;
    }
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
        : child.props.dangerouslySetInnerHTML
        ? child.props.dangerouslySetInnerHTML.__html
        : undefined;

    return (
      <div
        style={{
          ...props.style,
          background: 'transparent',
          backgroundColor: 'transparent',
        }}
      >
        <span
          style={{
            background: props.style?.color ?? color,
            lineHeight: '12px',
            opacity: opacity ?? undefined,
            ...(stringValue && stringValue.length > 80
              ? {
                  fontSize: '8px',
                }
              : {
                  height: '12px',
                  borderRadius: tokens.borderRadius,
                  display: 'inline-block',
                }),
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

      const backgroundColor =
        props.style.backgroundColor ?? theme?.colors.primary[500];
      const foregroundColor = props.style?.color ?? 'white';

      return (
        <button
          {...applyCommonProps(props)}
          style={{
            appearance: 'none',
            ...props.style,
            background:
              props.variant === 'text' ? foregroundColor : backgroundColor,
            height: '64px',
            borderRadius: tokens.borderRadius,
            ...(props.variant === 'text'
              ? {
                  border: `4px solid ${
                    theme?.colorMode === 'light' ? 'rgb(221,221,221)' : '#222'
                  }`,
                }
              : {
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }),
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
          }}
        >
          <span
            style={{
              ...props.style,
              background:
                props.variant === 'text' ? backgroundColor : foregroundColor,
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

      const isBackgroundImage = props.style?.zIndex?.toString().startsWith('-');

      return (
        <div
          {...applyCommonProps(props)}
          style={{
            ...props.style,
            ...(props.style.borderRadius && {
              borderRadius: tokens.borderRadius,
            }),
            background: isBackgroundImage
              ? 'white'
              : `linear-gradient(135deg, ${theme?.colors.primary[300]} 0%, ${theme?.colors.primary[500]} 100%)`,
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
