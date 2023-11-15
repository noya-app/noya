import { Button, IconButton, Spacer, Stack } from 'noya-designsystem';
import { InspectorPrimitives } from 'noya-inspector';
import React, { memo } from 'react';
import { ClientStorageKey, usePersistentState } from '../utils/clientStorage';

type Props = {
  children: React.ReactNode;
  title?: React.ReactNode;
  onClickTitle?: () => void;
  titleTextStyle?: 'small' | 'heading5' | 'heading4' | 'heading3';
  right?: React.ReactNode;
};

const InspectorSectionInternal = ({
  children,
  title,
  onClickTitle,
  titleTextStyle,
  right,
}: Props) => (
  <Stack.V
    padding={titleTextStyle === 'heading3' ? '12px' : '24px 12px 12px'}
    gap="12px"
    background="white"
  >
    {title && (
      <InspectorPrimitives.SectionHeader>
        {onClickTitle ? (
          <Button variant="none" onClick={onClickTitle}>
            <InspectorPrimitives.Title textStyle={titleTextStyle}>
              {title}
            </InspectorPrimitives.Title>
          </Button>
        ) : (
          <InspectorPrimitives.Title textStyle={titleTextStyle}>
            {title}
          </InspectorPrimitives.Title>
        )}
        <Spacer.Horizontal />
        {right}
      </InspectorPrimitives.SectionHeader>
    )}
    {children}
  </Stack.V>
);

const ExpandableInspectorSection = ({
  storageKey,
  ...props
}: Props & {
  storageKey: ClientStorageKey;
}) => {
  const [visibility, setVisibility] = usePersistentState<'show' | 'hide'>(
    storageKey,
    'show',
  );
  const expanded = visibility === 'show';

  return (
    <InspectorSectionInternal
      {...props}
      title={
        <Stack.H gap="4px" alignItems="center">
          {props.title}
          <IconButton
            iconName={expanded ? 'ChevronDownIcon' : 'ChevronRightIcon'}
            onClick={() => setVisibility(expanded ? 'hide' : 'show')}
          />
        </Stack.H>
      }
    >
      {expanded && props.children}
    </InspectorSectionInternal>
  );
};

export const InspectorSection = memo(function InspectorSection({
  storageKey,
  ...props
}: Props & { storageKey?: ClientStorageKey }) {
  return storageKey ? (
    <ExpandableInspectorSection {...props} storageKey={storageKey} />
  ) : (
    <InspectorSectionInternal {...props} />
  );
});
