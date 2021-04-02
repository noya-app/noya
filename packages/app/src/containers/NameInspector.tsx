import { InputField, Spacer } from 'noya-designsystem';
import { memo, useCallback } from 'react';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';
import { useApplicationState } from '../contexts/ApplicationStateContext';

interface Props {
  names: string[];
  ids: string[];
}

export default memo(function NameInspector({ names, ids }: Props) {
  const [, dispatch] = useApplicationState();
  const firstName = names[0];

  const name =
    names.length > 1 && !names.every((v: string) => v === firstName)
      ? undefined
      : firstName;

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.Title>Name</InspectorPrimitives.Title>
      <Spacer.Vertical size={4} />
      <InspectorPrimitives.Row>
        <InputField.Root id={'colorName'}>
          <InputField.Input
            value={name || ''}
            placeholder={name === undefined ? 'Multiple' : ''}
            onChange={useCallback(
              (value: string) => dispatch('setComponentName', ids, value),
              [ids, dispatch],
            )}
          />
        </InputField.Root>
      </InspectorPrimitives.Row>
    </InspectorPrimitives.Section>
  );
});
