/*
  The MIT License

  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import {
  EnumCellProps,
  isEnumControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsEnumCellProps } from '@jsonforms/react';
import { Select, SelectOption } from 'noya-designsystem';
import React from 'react';

export const EnumCell = (props: EnumCellProps) => {
  const { data, id, path, handleChange, options } = props;

  return (
    <Select<string>
      id={id}
      // disabled={!enabled}
      // autoFocus={uischema.options && uischema.options.focus}
      value={data || ''}
    >
      {[
        <SelectOption
          value="none"
          title="None"
          key="jsonforms.enum.none"
          onSelect={() => handleChange(path, undefined)}
        />,
      ].concat(
        (options ?? []).map((optionValue) => (
          <SelectOption
            value={optionValue.value}
            title={optionValue.label}
            key={optionValue.value}
            onSelect={() => handleChange(path, optionValue.value)}
          />
        )),
      )}
    </Select>
  );
};
/**
 * Default tester for enum controls.
 * @type {RankedTester}
 */
export const enumCellTester: RankedTester = rankWith(2, isEnumControl);

export const enumCellRenderer = withJsonFormsEnumCellProps(EnumCell);
