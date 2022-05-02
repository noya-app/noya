import { memo } from 'react';

import { InputField, Layout } from 'noya-designsystem';

import * as InspectorPrimitives from './InspectorPrimitives';

interface Props {
  names: string[];
  onNameChange: (value: string) => void;
}

export default memo(function NameInspector({ names, onNameChange }: Props) {
  const firstName = names[0];

  const name =
    names.length > 1 && !names.every((name: string) => name === firstName)
      ? undefined
      : firstName;

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.Title>Name</InspectorPrimitives.Title>
      <Layout.Stack size={4} />
      <InspectorPrimitives.Row>
        <InputField.Root>
          <InputField.Input
            value={name || ''}
            placeholder={name === undefined ? 'Multiple' : ''}
            onChange={onNameChange}
          />
        </InputField.Root>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
