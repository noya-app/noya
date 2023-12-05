// https://github.com/eclipsesource/jsonforms (MIT License)

import {
  ArrayControlProps,
  ControlElement,
  Paths,
  RankedTester,
  Resolve,
  Test,
  createDefaultValue,
  encode,
} from '@jsonforms/core';
import { DispatchCell, withJsonFormsArrayControlProps } from '@jsonforms/react';
import { IconButton, Stack } from 'noya-designsystem';
import { ArrayController } from 'noya-inspector';
import React from 'react';

const { or, isObjectArrayControl, isPrimitiveArrayControl, rankWith } = Test;

/**
 * Alternative tester for an array that also checks whether the 'table'
 * option is set.
 * @type {RankedTester}
 */
export const tableArrayControlTester: RankedTester = rankWith(
  3,
  or(isObjectArrayControl, isPrimitiveArrayControl),
);

class TableArrayControl extends React.Component<ArrayControlProps, any> {
  confirmDelete = (path: string, index: number) => {
    // const p = path.substring(0, path.lastIndexOf('.'));
    // this.props.removeItems(p, [index])();
  };

  render() {
    const {
      addItem,
      // uischema,
      schema,
      rootSchema,
      path,
      data,
      // visible,
      // errors,
      label,
      // childErrors,
      // translations,
      removeItems,
    } = this.props;

    // const controlElement = uischema // as ControlElement;
    const createControlElement = (key?: string): ControlElement => ({
      type: 'Control',
      label: false,
      scope: schema.type === 'object' ? `#/properties/${key}` : '#',
    });
    // const isValid = errors.length === 0;

    return (
      <ArrayController<any>
        id={path}
        padding={0}
        items={data && Array.isArray(data) ? data : []}
        title={label}
        onClickPlus={addItem(path, createDefaultValue(schema))}
        // onClickTrash={() => {}}
        renderItem={function ({
          item,
          index,
        }: {
          item: any;
          index: number;
        }): React.ReactNode {
          // console.log('render item', item, index);

          const childPath = Paths.compose(path, `${index}`);

          const cell = schema.properties ? (
            <DispatchCell
              schema={Resolve.schema(
                schema,
                `#/properties/${encode(index.toString())}`,
                rootSchema,
              )}
              uischema={createControlElement(encode(index.toString()))}
              path={childPath}
            />
          ) : (
            <DispatchCell
              schema={schema}
              uischema={createControlElement()}
              path={childPath}
            />
          );

          return (
            <Stack.H flex="1" gap="8px">
              {cell}
              <IconButton
                id={`${childPath}-delete`}
                iconName="Cross2Icon"
                size={13}
                contentStyle={{ margin: '1px' }}
                onClick={() => {
                  const p = childPath.substring(0, childPath.lastIndexOf('.'));
                  removeItems?.(p, [index])();
                }}
              />
            </Stack.H>
          );
        }}
      />
    );
  }
}

export const tableArrayRenderer =
  withJsonFormsArrayControlProps(TableArrayControl);
