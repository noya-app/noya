import { Spacer, Stack } from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import React from 'react';

export const InspectorSection = ({
  children,
  title,
  titleTextStyle,
  right,
}: {
  children: React.ReactNode;
  title?: string;
  titleTextStyle?: 'small' | 'heading5' | 'heading4' | 'heading3';
  right?: React.ReactNode;
}) => (
  <Stack.V
    padding={titleTextStyle === 'heading3' ? '12px' : '24px 12px 12px'}
    gap="12px"
    background="white"
  >
    {title && (
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title textStyle={titleTextStyle}>
          {title}
        </InspectorPrimitives.Title>
        <Spacer.Horizontal />
        {right}
      </InspectorPrimitives.SectionHeader>
    )}
    {children}
  </Stack.V>
);
