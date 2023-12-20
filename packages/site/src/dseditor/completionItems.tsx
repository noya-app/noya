import { CompletionItem } from 'noya-designsystem';
import { StarIcon } from 'noya-icons';
import { allClassNames, breakpoints, colorSchemes } from 'noya-tailwind';
import { cartesianProduct, range } from 'noya-utils';
import React from 'react';
import { HashtagIcon } from '../ayon/components/inspector/HashtagIcon';
import { PRIMITIVE_ELEMENT_MAP, primitiveElements } from './primitiveElements';

const colorScale = [50, ...range(100, 1000, 100)];

// bg-primary-100 through bg-primary-900
const primaryStyles = [
  ...colorScale.map((value) => `bg-primary-${value}`),
  ...colorScale.map((value) => `text-primary-${value}`),
  ...colorScale.map((value) => `border-primary-${value}`),
];

const baseStyleItems = [
  ...allClassNames.map(
    (item): CompletionItem => ({
      name: item,
      id: item,
      icon: <HashtagIcon item={item} />,
    }),
  ),
  ...primaryStyles.map(
    (item): CompletionItem => ({
      name: item,
      id: item,
      icon: <HashtagIcon item={item} />,
    }),
  ),
];

const breakpointStyleItems = cartesianProduct(baseStyleItems, [
  ...breakpoints,
  ...colorSchemes.filter((x) => x !== 'light'),
]).map(
  ([item, breakpoint]): CompletionItem => ({
    name: `${breakpoint}:${item.name}`,
    id: `${breakpoint}:${item.id}`,
    icon: item.icon,
  }),
);

export const styleItems = [...baseStyleItems, ...breakpointStyleItems];

export const primitiveElementStyleItems = Object.fromEntries(
  Object.entries(PRIMITIVE_ELEMENT_MAP).map(([id, metadata]) => [
    id,
    [
      ...styleItems,
      ...(metadata.variants ?? []).map((variant) => ({
        name: `variant-${variant}`,
        id: `variant-${variant}`,
        icon: <StarIcon />,
      })),
    ],
  ]),
);

export const typeItems = primitiveElements.flatMap((p): CompletionItem[] => [
  {
    id: p.id,
    name: p.name,
    icon: p.icon,
  },
  // ...(p.aliases ?? []).map((alias) => ({
  //   id: p.id,
  //   name: alias,
  //   icon: p.icon,
  // })),
]);
