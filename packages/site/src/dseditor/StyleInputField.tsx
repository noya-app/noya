import {
  InputFieldWithCompletions,
  fuzzyFilter,
} from '@noya-app/noya-designsystem';
import { range } from '@noya-app/noya-utils';
import { parseTailwindClass, stringifyTailwindClass } from 'noya-tailwind';
import React, { forwardRef, useMemo } from 'react';
import { primitiveElementStyleItems, styleItems } from './completionItems';

export const StyleInputField = forwardRef(function StyleInputField(
  {
    componentID,
    ...props
  }: Omit<
    React.ComponentProps<typeof InputFieldWithCompletions>,
    'placeholder' | 'items'
  > & {
    componentID: string;
  },
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const [value, setValue] = React.useState('');

  const items = useMemo(() => {
    let items = primitiveElementStyleItems[componentID] ?? styleItems;

    const { className, prefix, opacity } = parseTailwindClass(value);

    if (prefix) {
      items = items.map((item) => ({
        ...item,
        name: `${prefix}:${item.name}`,
        id: `${prefix}:${item.id}`,
      }));
    }

    if (opacity !== undefined) {
      const matches = fuzzyFilter({
        items: items.map((item) => item.name),
        query: stringifyTailwindClass({ className, prefix }),
      });

      if (matches.length > 0) {
        const firstMatch = matches[0];
        const item = items[firstMatch.index];

        items = range(5, 100, 5).map((value) => ({
          name: `${item.name}/${value}`,
          id: `${item.name}/${value}`,
        }));
      } else {
        items = [];
      }
    }

    return items;
  }, [componentID, value]);

  return (
    <InputFieldWithCompletions
      ref={forwardedRef}
      {...props}
      placeholder="Find style"
      items={items}
      onFocus={() => setValue('')}
      onChange={(value) => setValue(value)}
    />
  );
});
