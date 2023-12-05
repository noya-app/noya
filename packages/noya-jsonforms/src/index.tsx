// import { createAjv } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import {
  ArrayControl,
  BooleanCell,
  Categorization,
  DateCell,
  DateTimeCell,
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
import React, { ComponentProps } from 'react';
import { AnyOfRenderer, anyOfTester } from './AnyOfRenderer';
import { enumCellRenderer } from './EnumCell';
import { inputControlRenderer } from './InputControl';
import { numberCell, numberCellTester } from './NumberCell';
import { tableArrayRenderer } from './TableArrayControl';
import { textCellRenderer } from './TextCell';
import { VerticalLayoutRenderer, verticalLayoutTester } from './VerticalLayout';

// const handleDefaultsAjv = createAjv({
//   useDefaults: true,
//   formats: {
//     color: true,
//   },
// });

const customRenderers: ComponentProps<typeof JsonForms>['renderers'] = [
  { tester: inputControlTester, renderer: inputControlRenderer },
  { tester: radioGroupControlTester, renderer: RadioGroupControl },
  { tester: oneOfRadioGroupControlTester, renderer: OneOfRadioGroupControl },
  { tester: arrayControlTester, renderer: ArrayControl },
  // { tester: labelRendererTester, renderer: LabelRenderer },
  { tester: categorizationTester, renderer: Categorization },
  { tester: tableArrayControlTester, renderer: tableArrayRenderer },
  // { tester: groupTester, renderer: GroupLayout },
  { tester: verticalLayoutTester, renderer: VerticalLayoutRenderer },
  { tester: horizontalLayoutTester, renderer: HorizontalLayout },
  { tester: anyOfTester, renderer: AnyOfRenderer },
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

export function JSONForm<T>({
  data,
  setData,
}: {
  data: T;
  setData: (data: T) => void;
}) {
  const schema = getSchema();

  // console.log('schema', schema);

  return (
    <JsonForms
      schema={schema}
      // uischema={uischema}
      data={data}
      renderers={customRenderers}
      cells={customCells}
      onChange={({ data, errors }) => {
        // recursively remove undefined values
        const cleanData = removeUndefined(data);

        // console.log('new data', data, cleanData);

        setData(cleanData);
      }}
      // ajv={handleDefaultsAjv}
    />
  );
}

function removeUndefined(data: any): any {
  if (Array.isArray(data)) {
    return data.map(removeUndefined);
  } else if (typeof data === 'object') {
    const cleanData: any = {};

    for (const key in data) {
      const value = data[key];

      if (value !== undefined) {
        cleanData[key] = removeUndefined(value);
      }
    }

    return cleanData;
  } else {
    return data;
  }
}
