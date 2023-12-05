// https://github.com/eclipsesource/jsonforms (MIT License)

import {
  Generate,
  JsonSchema,
  UISchemaElement,
  isLayout,
} from '@jsonforms/core';
import { JsonFormsDispatch } from '@jsonforms/react';
import omit from 'lodash/omit';
import React from 'react';

interface CombinatorPropertiesProps {
  schema: JsonSchema;
  combinatorKeyword: 'oneOf' | 'anyOf';
  path: string;
  rootSchema: JsonSchema;
}

export class CombinatorProperties extends React.Component<
  CombinatorPropertiesProps,
  {}
> {
  render() {
    const { schema, combinatorKeyword, path, rootSchema } = this.props;

    const otherProps: JsonSchema = omit(
      schema,
      combinatorKeyword,
    ) as JsonSchema;
    const foundUISchema: UISchemaElement = Generate.uiSchema(
      otherProps,
      'VerticalLayout',
      undefined,
      rootSchema,
    );
    let isLayoutWithElements = false;
    if (foundUISchema !== null && isLayout(foundUISchema)) {
      isLayoutWithElements = foundUISchema.elements.length > 0;
    }

    if (isLayoutWithElements) {
      return (
        <JsonFormsDispatch
          schema={otherProps}
          path={path}
          uischema={foundUISchema}
        />
      );
    }

    return null;
  }
}

export default CombinatorProperties;
