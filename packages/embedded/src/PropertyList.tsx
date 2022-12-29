import { hexToRgba } from 'noya-colorpicker';
import {
  FillInputField,
  InputField,
  rgbaToSketchColor,
  ScrollArea,
  Spacer,
  withSeparatorElements,
} from 'noya-designsystem';
import React, { Fragment } from 'react';
import { z } from 'zod';
import * as InspectorPrimitives from './InspectorPrimitives';

const colorPropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal('color'),
  value: z.string(),
});

const dimensionPropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal('dimension'),
  value: z.string(),
});

const propertySchema = z.union([colorPropertySchema, dimensionPropertySchema]);

export const propertyListSchema = z.object({
  type: z.literal('propertyList'),
  data: z.array(propertySchema),
});

export function PropertyList({
  data,
  sendMessage,
}: {
  data: z.infer<typeof propertyListSchema>['data'];
  sendMessage: (message: any) => void;
}) {
  return (
    <ScrollArea>
      <InspectorPrimitives.Section>
        {withSeparatorElements(
          data.map((property) => (
            <Fragment key={property.id}>
              <InspectorPrimitives.SectionHeader>
                <InspectorPrimitives.Title>
                  {property.name}
                </InspectorPrimitives.Title>
              </InspectorPrimitives.SectionHeader>
              <Spacer.Vertical size={4} />
              <InspectorPrimitives.Row>
                {property.type === 'color' && (
                  <FillInputField
                    value={rgbaToSketchColor(hexToRgba(property.value))}
                  />
                )}
                {property.type === 'dimension' && (
                  <InputField.Root>
                    <InputField.NumberInput
                      value={parseFloat(property.value)}
                      onNudge={(value) => {
                        const newValue =
                          parseFloat(property.value) + value + 'px';

                        sendMessage({
                          type: 'setProperty',
                          id: property.id,
                          value: newValue,
                        });
                      }}
                      onSubmit={(value) => {
                        sendMessage({
                          type: 'setProperty',
                          id: property.id,
                          value,
                        });
                      }}
                    />
                    <InputField.DropdownMenu
                      id={`dimension-${property.id}`}
                      items={[
                        { title: 'px', value: 'px' },
                        { title: '%', value: '%' },
                        { title: 'pt', value: 'pt' },
                        { title: 'em', value: 'em' },
                        { title: 'rem', value: 'rem' },
                        { title: 'cm', value: 'cm' },
                        { title: 'mm', value: 'mm' },
                        { title: 'in', value: 'in' },
                        { title: 'pc', value: 'pc' },
                        { title: 'ex', value: 'ex' },
                        { title: 'ch', value: 'ch' },
                        { title: 'vw', value: 'vw' },
                        { title: 'vh', value: 'vh' },
                        { title: 'vmin', value: 'vmin' },
                        { title: 'vmax', value: 'vmax' },
                      ]}
                      onSelect={(value) => {
                        // sendMessage({
                        //   type: 'setProperty',
                        //   id: property.id,
                        //   value: `${property.value}${value}`,
                        // });
                      }}
                    />
                    <InputField.Label>px</InputField.Label>
                  </InputField.Root>
                )}
              </InspectorPrimitives.Row>
            </Fragment>
          )),
          <Spacer.Vertical size={16} />,
        )}
      </InspectorPrimitives.Section>
    </ScrollArea>
  );
}
