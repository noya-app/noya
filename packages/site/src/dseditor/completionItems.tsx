import { CompletionItem } from '@noya-app/noya-designsystem';
import { StarIcon } from '@noya-app/noya-icons';
import { suggestedClasses } from '@noya-app/noya-tailwind';
import { range } from '@noya-app/noya-utils';
import { PRIMITIVE_ELEMENT_MAP, primitiveElements } from 'noya-component';
import React from 'react';
import { HashtagIcon } from '../ayon/components/inspector/HashtagIcon';

const colorScale = [50, ...range(100, 1000, 100)];

// bg-primary-100 through bg-primary-900
const primaryStyles = [
  ...colorScale.map((value) => `bg-primary-${value}`),
  ...colorScale.map((value) => `text-primary-${value}`),
  ...colorScale.map((value) => `border-primary-${value}`),
];

export const styleItems = [
  ...suggestedClasses.map(
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

export const primitiveElementStyleItems = Object.fromEntries(
  Object.entries(PRIMITIVE_ELEMENT_MAP).map(
    ([id, metadata]): [string, CompletionItem[]] => [
      id,
      [
        ...styleItems,
        ...(metadata.variants ?? []).map((variant) => ({
          name: `variant-${variant}`,
          id: `variant-${variant}`,
          icon: <StarIcon />,
        })),
      ],
    ],
  ),
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
