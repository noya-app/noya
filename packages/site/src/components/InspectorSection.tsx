import { Stack } from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import React from 'react';

export const InspectorSection = ({
  children,
  title,
  titleTextStyle,
}: {
  children: React.ReactNode;
  title?: string;
  titleTextStyle?: 'small' | 'heading5' | 'heading4' | 'heading3';
}) => (
  <Stack.V
    padding={title ? '32px 12px 12px' : '12px'}
    gap="12px"
    background="white"
  >
    {title && (
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title textStyle={titleTextStyle}>
          {title}
        </InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
    )}
    {children}
  </Stack.V>
);
