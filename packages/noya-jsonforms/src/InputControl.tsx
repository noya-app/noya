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
  computeLabel,
  ControlProps,
  ControlState,
  isControl,
  isDescriptionHidden,
  NOT_APPLICABLE,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import {
  Control,
  DispatchCell,
  withJsonFormsControlProps,
} from '@jsonforms/react';
import maxBy from 'lodash/maxBy';
import merge from 'lodash/merge';
import { Small, Stack } from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import React from 'react';

export class InputControl extends Control<ControlProps, ControlState> {
  render() {
    const {
      description,
      id,
      errors,
      label,
      uischema,
      schema,
      rootSchema,
      visible,
      enabled,
      required,
      path,
      cells,
      config,
    } = this.props;

    const isValid = errors.length === 0;

    // const divClassNames = [classNames.validation]
    //   .concat(isValid ? classNames.description : classNames.validationError)
    //   .join(' ');

    const appliedUiSchemaOptions = merge({}, config, uischema.options);
    const showDescription = !isDescriptionHidden(
      visible,
      description,
      this.state.isFocused,
      appliedUiSchemaOptions.showUnfocusedDescription,
    );
    const testerContext = {
      rootSchema: rootSchema,
      config: config,
    };
    const cell = maxBy(cells, (r) => r.tester(uischema, schema, testerContext));
    if (
      cell === undefined ||
      cell.tester(uischema, schema, testerContext) === NOT_APPLICABLE
    ) {
      console.warn('No applicable cell found.', uischema, schema);
      return null;
    } else {
      const details = !isValid ? errors : showDescription ? description : null;

      return (
        <Stack.V gap={4}>
          <InspectorPrimitives.LabeledRow
            // className={classNames.wrapper}
            // display={!visible ? 'none' : 'flex'}
            // onFocus={this.onFocus}
            // onBlur={this.onBlur}
            id={id}
            label={computeLabel(
              label,
              required || false,
              appliedUiSchemaOptions.hideRequiredAsterisk,
            )}
          >
            <DispatchCell
              uischema={uischema}
              schema={schema}
              path={path}
              id={id + '-input'}
              enabled={enabled}
            />
          </InspectorPrimitives.LabeledRow>
          {details && (
            <Small color={!isValid ? 'primary' : 'textMuted'}>{details}</Small>
          )}
        </Stack.V>
      );
    }
  }
}

export const inputControlTester: RankedTester = rankWith(1, isControl);

export const inputControlRenderer = withJsonFormsControlProps(InputControl);
