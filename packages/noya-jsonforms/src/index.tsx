// import { createAjv } from '@jsonforms/core';
import { createAjv } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import {
  ArrayControl,
  BooleanCell,
  Categorization,
  DateCell,
  DateTimeCell,
  GroupLayout,
  HorizontalLayout,
  OneOfRadioGroupControl,
  RadioGroupControl,
  SliderCell,
  TextAreaCell,
  TimeCell,
  arrayControlTester,
  booleanCellTester,
  categorizationTester,
  dateCellTester,
  dateTimeCellTester,
  enumCellTester,
  groupTester,
  horizontalLayoutTester,
  inputControlTester,
  integerCellTester,
  oneOfRadioGroupControlTester,
  radioGroupControlTester,
  sliderCellTester,
  tableArrayControlTester,
  textAreaCellTester,
  textCellTester,
  timeCellTester,
} from '@jsonforms/vanilla-renderers';
import { getSchema } from 'noya-component';
import React, { ComponentProps, memo, useCallback } from 'react';
import { AnyOfRenderer, anyOfTester } from './AnyOfRenderer';
import { enumCellRenderer } from './EnumCell';
import { inputControlRenderer } from './InputControl';
import { numberCell, numberCellTester } from './NumberCell';
import { objectControlTester, objectRenderer } from './ObjectControl';
import { tableArrayRenderer } from './TableArrayControl';
import { textCellRenderer } from './TextCell';
import { verticalLayoutRenderer, verticalLayoutTester } from './VerticalLayout';

const handleDefaultsAjv = createAjv({
  // useDefaults: true,
  formats: {
    color: true,
  },
});

const customRenderers: ComponentProps<typeof JsonForms>['renderers'] = [
  { tester: inputControlTester, renderer: inputControlRenderer },
  { tester: radioGroupControlTester, renderer: RadioGroupControl },
  { tester: oneOfRadioGroupControlTester, renderer: OneOfRadioGroupControl },
  { tester: arrayControlTester, renderer: ArrayControl },
  // { tester: labelRendererTester, renderer: LabelRenderer },
  { tester: categorizationTester, renderer: Categorization },
  { tester: tableArrayControlTester, renderer: tableArrayRenderer },
  { tester: groupTester, renderer: verticalLayoutRenderer },
  { tester: groupTester, renderer: GroupLayout },
  { tester: verticalLayoutTester, renderer: verticalLayoutRenderer },
  { tester: horizontalLayoutTester, renderer: HorizontalLayout },
  { tester: anyOfTester, renderer: AnyOfRenderer },
  { tester: objectControlTester, renderer: objectRenderer },
  // ...vanillaRenderers,
];
const customCells: ComponentProps<typeof JsonForms>['cells'] = [
  { tester: booleanCellTester, cell: BooleanCell },
  { tester: dateCellTester, cell: DateCell },
  { tester: dateTimeCellTester, cell: DateTimeCell },
  { tester: enumCellTester, cell: enumCellRenderer },
  { tester: integerCellTester, cell: numberCell },
  { tester: numberCellTester, cell: numberCell },
  { tester: sliderCellTester, cell: SliderCell },
  { tester: textAreaCellTester, cell: TextAreaCell },
  { tester: textCellTester, cell: textCellRenderer },
  { tester: timeCellTester, cell: TimeCell },
];

export const JSONForm = memo(function JSONForm<T>({
  data,
  setData,
}: {
  data: T;
  setData: (data: T) => void;
}) {
  const schema = getSchema();

  const handleChange: ComponentProps<typeof JsonForms>['onChange'] =
    useCallback(
      ({ data, errors }) => {
        // recursively remove undefined values
        // const cleanData = removeUndefined(data);

        // console.log('new data', data, cleanData);

        setData(data);
      },
      [setData],
    );

  return (
    <JsonForms
      schema={schema}
      data={data}
      renderers={customRenderers}
      cells={customCells}
      onChange={handleChange}
      // uischema={uischema}
      ajv={handleDefaultsAjv}
    />
  );
});

// function removeUndefined(data: any): any {
//   if (Array.isArray(data)) {
//     return data.map(removeUndefined);
//   } else if (typeof data === 'object') {
//     const cleanData: any = {};

//     for (const key in data) {
//       const value = data[key];

//       if (value !== undefined) {
//         cleanData[key] = removeUndefined(value);
//       }
//     }

//     return cleanData;
//   } else {
//     return data;
//   }
// }
