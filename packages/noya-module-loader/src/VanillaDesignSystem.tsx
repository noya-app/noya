/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/alt-text */
import {
  ButtonVariant,
  DesignSystemDefinition,
  applyCommonProps,
  component,
  x,
} from '@noya-design-system/protocol';
import { DSConfig } from 'noya-api';
import { filterTailwindClassesByLastInGroup } from 'noya-tailwind';
import React, { CSSProperties } from 'react';
import ReactDOM from 'react-dom';

const handler = {
  get(target: any, property: string | symbol): any {
    if (property in target) return target[property];

    return (props: any) => {
      return <div {...applyCommonProps(props)} />;
    };
  },
};

function getDSConfig(props: any): DSConfig {
  if (props._noya && props._noya.dsConfig) return props._noya.dsConfig;
  return { colorMode: 'light', colors: { primary: 'blue' } };
}

function getStyler(props: any): (className: string | string[]) => {
  style?: CSSProperties;
  className?: string;
} {
  if (props._noya && props._noya.getStylingProps) {
    return props._noya.getStylingProps;
  } else {
    return (_: string | string[]) => ({});
  }
}

function parseClasses(classes: string | undefined) {
  return classes?.split(/\s+/) ?? [];
}

function createStylingProps(props: unknown, classes: (string | false)[]) {
  const className = (props as any).className as string | undefined;
  const style = (props as any).style as CSSProperties | undefined;

  const getStylingProps = getStyler(props);

  const filteredClasses = filterTailwindClassesByLastInGroup(
    [...classes, ...parseClasses(className)].filter(
      (x): x is string => typeof x === 'string',
    ),
  );

  const result = getStylingProps(filteredClasses);

  return {
    ...result,
    style: { ...result.style, ...style },
  };
}

const proxyObject = new Proxy(
  {
    [component.id.Box]: (props: any) => {
      return <div {...applyCommonProps(props)} />;
    },
    [component.id.Card]: (props: any) => {
      const stylingProps = createStylingProps(props, [
        `rounded-lg`,
        `bg-white`,
        `dark:bg-gray-800`,
        `border`,
        `border-gray-200`,
        `dark:border-gray-700`,
        `p-4`,
      ]);

      return <div {...applyCommonProps({ ...props, ...stylingProps })} />;
    },
    [component.id.Button]: (props: any) => {
      const config = getDSConfig(props);
      const variant = (props.variant as ButtonVariant) ?? 'solid';
      const stylingProps = createStylingProps(props, [
        `appearance-none`,
        ...(variant === 'solid'
          ? [
              `bg-${config.colors.primary}-500`,
              `hover:bg-${config.colors.primary}-400`,
              `text-white`,
              `shadow-sm`,
            ]
          : []),
        ...(variant === 'outline'
          ? [
              `border`,
              `border-${config.colors.primary}-500`,
              `text-${config.colors.primary}-500`,
              `hover:bg-${config.colors.primary}-50`,
              `hover:text-${config.colors.primary}-700`,
            ]
          : []),
        ...(variant === 'text'
          ? [
              `text-${config.colors.primary}-500`,
              `hover:bg-${config.colors.primary}-50`,
              `hover:text-${config.colors.primary}-700`,
            ]
          : []),
        `rounded-md`,
        `px-3.5`,
        `py-2.5`,
        `text-sm`,
        `font-semibold`,
      ]);

      return <button {...applyCommonProps({ ...props, ...stylingProps })} />;
    },
    [component.id.Text]: (props: any) => {
      const stylingProps = createStylingProps(
        props,
        [
          'text-black',
          'dark:text-white',
          props.variant === 'h1' && `text-5xl`,
          props.variant === 'h2' && `text-4xl`,
          props.variant === 'h3' && `text-3xl`,
          props.variant === 'h4' && `text-2xl`,
          props.variant === 'h5' && `text-xl`,
          props.variant === 'h6' && `text-lg`,
        ].filter(Boolean),
      );

      return <span {...applyCommonProps({ ...props, ...stylingProps })} />;
    },
    [component.id.Link]: (props: any) => {
      const config = getDSConfig(props);

      const stylingProps = createStylingProps(props, [
        `text-${config.colors.primary}-500`,
        `hover:text-${config.colors.primary}-400`,
      ]);

      return (
        <a
          {...applyCommonProps({ ...props, ...stylingProps })}
          href={props.href}
        />
      );
    },
    [component.id.Tag]: (props: any) => {
      const config = getDSConfig(props);

      const stylingProps = createStylingProps(props, [
        `inline-flex`,
        `items-center`,
        `px-2.5`,
        `py-0.5`,
        `rounded-full`,
        `text-xs`,
        `font-medium`,
        `bg-${config.colors.primary}-200/10`,
        `dark:bg-${config.colors.primary}-500/10`,
        `border`,
        `border-${config.colors.primary}-600/10`,
        `text-${config.colors.primary}-600`,
      ]);

      return <div {...applyCommonProps({ ...props, ...stylingProps })} />;
    },
    [component.id.Input]: (props: any) => {
      const stylingProps = createStylingProps(props, [
        `block`,
        `w-full`,
        `rounded-md`,
        `border-0`,
        `px-4`,
        `py-2`,
        `text-gray-900`,
        `shadow-sm`,
        `ring-1`,
        `ring-inset`,
        `ring-gray-300`,
        `placeholder:text-gray-400`,
        `focus:ring-2`,
        `focus:ring-inset`,
        `focus:ring-indigo-600`,
        `sm:text-sm`,
        `sm:leading-6`,
      ]);

      return <input {...applyCommonProps({ ...props, ...stylingProps })} />;
    },
    [component.id.Image]: (props: any) => {
      return <img {...applyCommonProps(props)} src={props.src} />;
    },
    [component.id.Avatar]: (props: any) => {
      const colorMode = getDSConfig(props).colorMode ?? 'light';

      const stylingProps = createStylingProps(props, [
        `rounded-full`,
        `flex`,
        `items-center`,
        `justify-center`,
        'overflow-hidden',
        `bg-${colorMode === 'light' ? 'gray-100' : 'gray-800'}`,
        `text-${colorMode === 'light' ? 'gray-300' : 'gray-600'}`,
      ]);

      return (
        <div {...applyCommonProps({ ...props, ...stylingProps })}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="relative w-full h-full translate-y-[12.5%]"
          >
            <path
              fillRule="evenodd"
              d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    },
    [component.id.Provider]: (props: any) => {
      const config = getDSConfig(props);

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Manrope, sans-serif',
            ...(config.colorMode === 'dark' && { background: '#111' }),
          }}
        >
          {props.children}
        </div>
      );
    },
    [component.id.NextProvider]: undefined,
  },
  handler,
);

export const VanillaDesignSystem: DesignSystemDefinition = {
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
