import { classNameToStyle } from 'noya-tailwind';
import React from 'react';

export function HashtagIcon({ item }: { item: string }) {
  let resolvedStyle = classNameToStyle(item.replace('fill', 'bg'));

  return (
    <div
      style={{
        borderWidth: /^border(?!-\d)/.test(item) ? 1 : undefined,
        background: /^rounded/.test(item)
          ? 'rgb(148 163 184)'
          : /^opacity/.test(item)
          ? 'black'
          : undefined,
        ...resolvedStyle,
        padding: 0,
        margin: 0,
        width: 19,
        height: 19,
      }}
    >
      {/^(text|font)/.test(item) ? 'Tt' : null}
    </div>
  );
}
