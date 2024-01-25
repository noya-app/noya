import { classNamesToStyle } from '@noya-app/noya-tailwind';
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

    const hasSmallTitleVariant =
      'variant' in props &&
      typeof props.variant === 'string' &&
      /^(h4|h5|h6)/.test(props.variant);

    if (hasTitleVariant) {
      const fontProps = classNamesToStyle(
        [
          ...(props.variant === 'h1'
            ? ['text-6xl', 'font-bold', 'tracking-tight']
            : []),
          ...(props.variant === 'h2'
            ? ['text-5xl', 'font-bold', 'tracking-tight']
            : []),
          ...(props.variant === 'h3'
            ? ['text-4xl', 'font-bold', 'tracking-tight']
            : []),
          ...(props.variant === 'h4'
            ? ['text-3xl', 'font-bold', 'tracking-tight']
            : []),
          ...(props.variant === 'h5'
            ? ['text-2xl', 'font-semibold', 'tracking-tight']
            : []),
          ...(props.variant === 'h6'
            ? ['text-xl', 'font-semibold', 'tracking-tight']
            : []),
          ...(props.variant === 'subtitle1'
            ? ['text-lg', 'font-semibold']
            : []),
          ...(props.variant === 'subtitle2' ? ['font-semibold'] : []),
          ...(props.variant === 'body1' ? ['text-lg', 'leading-relaxed'] : []),
          ...(props.variant === 'body2' ? ['leading-relaxed'] : []),
          ...(props.variant === 'caption1' ? ['text-sm'] : []),
        ].filter(Boolean),
      );

      const childWithStyle = React.cloneElement(child, {
        style: {
          color: titleColor,
          // color: props.style?.color ?? titleColor,
        },
      });

      return (
        <span
          style={{
            ...props.style,
            fontFamily: 'sans-serif',
            // fontSize,
            ...fontProps,
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

    const lineHeight = '12px';

    return (
      <div
        style={{
          ...props.style,
          background: 'transparent',
          backgroundColor: 'transparent',
          // lineHeight: lineHeight,
        }}
      >
        <span
          style={{
            background: hasSmallTitleVariant ? '#231951B3' : color,
            // background: props.style?.color ?? color,
            lineHeight: lineHeight,
            opacity: opacity ?? undefined,
            ...(stringValue && stringValue.length > 80
              ? {
                  fontSize: '8px',
                }
              : {
                  height: lineHeight,
                  borderRadius: tokens.borderRadius,
                  display: 'inline-block',
                }),
          }}
        >
          <span
            style={{
              color: 'transparent',
              // lineHeight: lineHeight
            }}
          >
            {child}
          </span>
        </span>
      </div>
    );
  }

  return <span {...applyCommonProps(props)} />;
};

function getAccentColor(props: any) {
  return '#6746FF';
  // const theme = getTheme(props);
  // return theme?.colors.primary[500] ?? '#ccc';
}

const proxyObject = new Proxy(
  {
    [component.id.Box]: (props: any) => {
      return (
        <div
          {...applyCommonProps(props)}
          style={{
            borderColor: '#23195133',
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
            borderRadius: '20px',
            border: '4px dashed #23195133',
            padding: '16px',
          }}
        />
      );
    },
    [component.id.Button]: (props: any) => {
      const theme = getTheme(props);

      const backgroundColor =
        props.style.backgroundColor ?? getAccentColor(props);
      const foregroundColor = props.style?.color ?? 'white';

      const childCount = React.Children.count(props.children);

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
                  // boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }),
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 16px',
          }}
        >
          {childCount > 1 ? (
            props.children
          ) : (
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
          )}
        </button>
      );
    },
    [component.id.Text]: (props: any) => {
      return TextComponent(props, {
        color: '#23195133',
        titleColor: '#231951',
      });
    },
    [component.id.Link]: (props: any) => {
      const theme = getTheme(props);

      return TextComponent(props, {
        color: getAccentColor(theme) || '#ccc',
        titleColor: getAccentColor(theme) || '#ccc',
      });
    },
    [component.id.Tag]: (props: any) => {
      const theme = getTheme(props);

      return TextComponent(props, {
        color: getAccentColor(theme) || '#ccc',
        titleColor: getAccentColor(theme) || '#ccc',
        // opacity: 0.3,
      });
    },
    [component.id.Input]: (props: any) => {
      return (
        <input
          {...applyCommonProps(props)}
          style={{
            appearance: 'none',
            ...props.style,
            background: '#fff',
            border: `4px solid ${getAccentColor(props)}`,
            padding: '0',
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
            ...(props.style.borderRadius
              ? {
                  borderRadius: tokens.borderRadius,
                }
              : {
                  borderRadius: '8px',
                }),
            background: isBackgroundImage
              ? 'transparent'
              : getAccentColor(theme) || '#ccc',
            // background: isBackgroundImage
            //   ? 'white'
            //   : `linear-gradient(135deg, ${theme?.colors.primary[300]} 0%, ${theme?.colors.primary[500]} 100%)`,
          }}
        />
      );
    },
    [component.id.Avatar]: (props: any) => {
      return (
        <div
          {...applyCommonProps(props)}
          style={{
            ...props.style,
            borderRadius: '1000px',
            background: getAccentColor(props),
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
