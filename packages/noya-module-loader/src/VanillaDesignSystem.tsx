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
import React from 'react';
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

function parseClasses(classes: string | undefined) {
  return classes?.split(/\s+/) ?? [];
}

function mergeClasses(
  classes: (string | false)[],
  className: string | undefined,
) {
  return filterTailwindClassesByLastInGroup(
    [...classes, ...parseClasses(className)].filter(
      (x): x is string => typeof x === 'string',
    ),
  ).join(' ');
}

const proxyObject = new Proxy(
  {
    [component.id.Box]: (props: any) => {
      return <div {...applyCommonProps(props)} />;
    },
    [component.id.Card]: (props: any) => {
      const className = mergeClasses(
        [`rounded-lg`, `bg-white`, `border`, `border-gray-200`, `p-4`],
        props.className,
      );

      return <div {...applyCommonProps({ ...props, className })} />;
    },
    [component.id.Button]: (props: any) => {
      const config = getDSConfig(props);
      const variant = (props.variant as ButtonVariant) ?? 'solid';

      const className = mergeClasses(
        [
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
        ],
        props.className,
      );

      return <button {...applyCommonProps({ ...props, className })} />;
    },
    [component.id.Text]: (props: any) => {
      const colorMode = getDSConfig(props).colorMode ?? 'light';

      const className = [
        `text-${colorMode === 'light' ? 'black' : 'white'}`,
        ...parseClasses(props.className),
        props.variant === 'h1' && `text-5xl`,
        props.variant === 'h2' && `text-4xl`,
        props.variant === 'h3' && `text-3xl`,
        props.variant === 'h4' && `text-2xl`,
        props.variant === 'h5' && `text-xl`,
        props.variant === 'h6' && `text-lg`,
      ]
        .filter(Boolean)
        .join(' ');

      return <span {...applyCommonProps({ ...props, className })} />;
    },
    [component.id.Link]: (props: any) => {
      const config = getDSConfig(props);

      const className = mergeClasses(
        [
          `text-${config.colors.primary}-500`,
          `hover:text-${config.colors.primary}-400`,
        ],
        props.className,
      );

      return (
        <a {...applyCommonProps({ ...props, className })} href={props.href} />
      );
    },
    [component.id.Tag]: (props: any) => {
      const config = getDSConfig(props);

      const className = mergeClasses(
        [
          `inline-flex`,
          `items-center`,
          `px-2.5`,
          `py-1`,
          `rounded-full`,
          `text-xs`,
          `font-medium`,
          `bg-${config.colors.primary}-200/50`,
          // `border`,
          // `border-${config.colors.primary}-900/10`,
          `text-${config.colors.primary}-600`,
        ],
        props.className,
      );

      return <div {...applyCommonProps({ ...props, className })} />;
    },
    [component.id.Input]: (props: any) => {
      const className = mergeClasses(
        [
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
        ],
        props.className,
      );

      return <input {...applyCommonProps({ ...props, className })} />;
    },
    [component.id.Image]: (props: any) => {
      return <img {...applyCommonProps(props)} src={props.src} />;
    },
    [component.id.Avatar]: (props: any) => {
      const colorMode = getDSConfig(props).colorMode ?? 'light';

      const className = mergeClasses(
        [
          `rounded-full`,
          `flex`,
          `items-center`,
          `justify-center`,
          'overflow-hidden',
          `bg-${colorMode === 'light' ? 'gray-100' : 'gray-800'}`,
          `text-${colorMode === 'light' ? 'gray-300' : 'gray-600'}`,
        ],
        props.className,
      );

      return (
        <div {...applyCommonProps({ ...props, className })}>
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
    [component.id.Provider]: undefined,
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
