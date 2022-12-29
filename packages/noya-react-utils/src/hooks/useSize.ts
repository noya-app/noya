// MIT License
//
// Copyright (c) 2020 Modulz
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// https://github.com/radix-ui/primitives/blob/f3de622e944785d01eb6041249ca1645f79ce102/packages/react/utils/src/useSize.tsx

/// <reference types="resize-observer-browser" />

import * as React from 'react';

type Size = {
  width: number;
  height: number;
};

export function useSize(
  /** A reference to the element whose size to observe */
  refToObserve: React.RefObject<HTMLElement | SVGElement>,
) {
  const [size, setSize] = React.useState<Size | undefined>(undefined);

  React.useEffect(() => {
    if (refToObserve.current) {
      const elementToObserve = refToObserve.current;
      const resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries)) {
          return;
        }

        // Since we only observe the one element, we don't need to loop over the
        // array
        if (!entries.length) {
          return;
        }

        const entry = entries[0];
        let width: number;
        let height: number;

        if ('borderBoxSize' in entry) {
          const borderSizeEntry = entry['borderBoxSize'];
          // iron out differences between browsers
          const borderSize = Array.isArray(borderSizeEntry)
            ? borderSizeEntry[0]
            : borderSizeEntry;
          width = borderSize['inlineSize'];
          height = borderSize['blockSize'];
        } else {
          // for browsers that don't support `borderBoxSize`
          // we calculate a rect ourselves to get the correct border box.
          const rect = elementToObserve.getBoundingClientRect();
          width = rect.width;
          height = rect.height;
        }

        setSize({ width, height });
      });

      resizeObserver.observe(elementToObserve, { box: 'border-box' });

      return () => {
        setSize(undefined);
        resizeObserver.unobserve(elementToObserve);
      };
    }
    return;
  }, [refToObserve]);

  return size;
}
