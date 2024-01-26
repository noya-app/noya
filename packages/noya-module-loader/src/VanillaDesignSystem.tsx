/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/alt-text */
import { filterTailwindClassesByLastInGroup } from '@noya-app/noya-tailwind';
import {
  ButtonVariant,
  CheckboxProps,
  DesignSystemDefinition,
  InputProps,
  applyCommonProps,
  component,
  x,
} from '@noya-design-system/protocol';
import { DSConfig } from 'noya-api';
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
      const stylingProps = createStylingProps(props, [`box-border`]);

      return (
        <div
          {...applyCommonProps({
            ...props,
            ...stylingProps,
          })}
        />
      );
    },
    [component.id.Card]: (props: any) => {
      const stylingProps = createStylingProps(props, [
        `box-border`,
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
        'appearance-none',
        'text-sm',
        'font-bold',
        'rounded-md',
        'px-3.5',
        'py-2.5',
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
              `bg-white`,
              `dark:bg-neutral-900`,
              `ring-1`,
              `ring-${config.colors.primary}-500`,
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
      ]);

      return <button {...applyCommonProps({ ...props, ...stylingProps })} />;
    },
    [component.id.Text]: (props: any) => {
      const stylingProps = createStylingProps(
        props,
        [
          'text-black',
          'dark:text-white',
          ...(props.variant === 'h1'
            ? ['text-6xl', 'font-bold', 'tracking-tighter']
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

      return <span {...applyCommonProps({ ...props, ...stylingProps })} />;
    },
    [component.id.Link]: (props: any) => {
      const config = getDSConfig(props);

      const stylingProps = createStylingProps(props, [
        `no-underline`,
        'text-sm',
        'font-bold',
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
        'inline-flex',
        'items-center',
        'px-2.5',
        'py-0.5',
        'rounded-full',
        'text-sm',
        'font-medium',
        `bg-${config.colors.primary}-200/20`,
        `dark:bg-${config.colors.primary}-500/20`,
        // `border`,
        // `border-${config.colors.primary}-600/10`,
        `text-${config.colors.primary}-600/80`,
      ]);

      return <div {...applyCommonProps({ ...props, ...stylingProps })} />;
    },
    [component.id.Input]: (props: InputProps) => {
      const stylingProps = createStylingProps(props, [
        `box-border`,
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

      return (
        <input
          {...applyCommonProps({ ...props, ...stylingProps })}
          value={props.value}
          placeholder={props.placeholder}
          disabled={props.disabled}
        />
      );
    },
    [component.id.Checkbox]: (props: CheckboxProps) => {
      const getStylingProps = getStyler(props);

      const containerStylingProps = getStylingProps([
        'flex',
        'items-center',
        'gap-2',
      ]);

      const stylingProps = createStylingProps(props, [
        'w-5',
        'h-5',
        'rounded',
        'shadow-sm',
        'ring-1',
        'ring-neutral-500',
        ...(props.checked ? ['bg-primary-500', 'ring-primary-500'] : []),
        'focus:ring',
        'focus:ring-indigo-200',
        'focus:ring-opacity-50',
      ]);

      return (
        <div {...applyCommonProps({ ...props, ...containerStylingProps })}>
          <button
            role="checkbox"
            aria-checked={props.checked}
            disabled={props.disabled}
            {...stylingProps}
          />
          {props.label && (
            <label className="font-medium text-gray-700 select-none">
              {props.label}
            </label>
          )}
        </div>
      );
    },
    [component.id.Image]: (props: any) => {
      return <img {...applyCommonProps(props)} src={props.src} />;
    },
    [component.id.Avatar]: (props: any) => {
      const colorMode = getDSConfig(props).colorMode ?? 'light';

      const stylingProps = createStylingProps(props, [
        `rounded-full`,
        'overflow-hidden',
        ...(!props.src
          ? [
              `flex`,
              `items-center`,
              `justify-center`,
              `text-${colorMode === 'light' ? 'gray-300' : 'gray-600'}`,
            ]
          : []),
        `bg-${colorMode === 'light' ? 'gray-100' : 'gray-800'}`,
      ]);

      const imageStylingProps = createStylingProps(props, [
        `w-full`,
        `h-full`,
        `object-cover`,
      ]);

      return (
        <div {...applyCommonProps({ ...props, ...stylingProps })}>
          {props.src ? (
            <img src={props.src} {...applyCommonProps(imageStylingProps)} />
          ) : (
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
          )}
        </div>
      );
    },
    [component.id.Provider]: (props: any) => {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter', // Gets swapped at compile-time
          }}
        >
          {props.children}
        </div>
      );
    },
    [component.id.NextProvider]: (props: any) => {
      const config = getDSConfig(props);

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            ...(config.colorMode === 'dark' && { background: '#111' }),
          }}
        >
          {props.children}
        </div>
      );
    },
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
