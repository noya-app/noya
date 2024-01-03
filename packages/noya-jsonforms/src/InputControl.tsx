// https://github.com/eclipsesource/jsonforms (MIT License)

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
import { Small, Stack } from '@noya-app/noya-designsystem';
import maxBy from 'lodash/maxBy';
import merge from 'lodash/merge';
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
