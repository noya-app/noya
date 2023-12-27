import { InputFieldWithCompletions, fuzzyFilter } from 'noya-designsystem';
import { breakpoints } from 'noya-tailwind';
import { range } from 'noya-utils';
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

    for (let bp of breakpoints) {
      if (value.startsWith(`${bp}:`)) {
        items = items.map((item) => ({
          ...item,
          name: `${bp}:${item.name}`,
          id: `${bp}:${item.id}`,
        }));
      }
    }

    if (value.startsWith('dark:')) {
      items = items.map((item) => ({
        ...item,
        name: `dark:${item.name}`,
        id: `dark:${item.id}`,
      }));
    }

    if (value.includes('/')) {
      const prefix = value.split('/')[0];

      const matches = fuzzyFilter({
        items: items.map((item) => item.name),
        query: prefix,
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
