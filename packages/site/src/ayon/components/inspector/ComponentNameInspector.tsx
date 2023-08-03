import { useGeneratedComponentNames, useNoyaClient } from 'noya-api';
import {
  CompletionItem,
  CompletionSectionHeader,
  InputFieldWithCompletions,
} from 'noya-designsystem';
import { Rect } from 'noya-geometry';
import { debounce } from 'noya-utils';
import React, { useEffect, useMemo, useState } from 'react';

export function ComponentNameInspector({
  name,
  frame,
  onChangeName,
}: {
  name: string;
  frame: Rect;
  onChangeName: (name: string) => void;
}) {
  const client = useNoyaClient();
  const [customName, setCustomName] = useState(name);
  const { loading, names } = useGeneratedComponentNames(customName);

  const completionItems = useMemo(
    (): (CompletionItem | CompletionSectionHeader)[] => [
      { type: 'sectionHeader', id: 'design-system', name: 'Design System' },
      // { id: 'avatar', name: 'Avatar' },
      // { id: 'button', name: 'Button' },
      { type: 'sectionHeader', id: 'generated', name: 'AI Generated' },
      ...names.map(
        ({ name }): CompletionItem => ({ id: name, name, alwaysInclude: true }),
      ),
      { type: 'sectionHeader', id: 'create-new', name: 'Create New' },
      ...(customName && customName !== name
        ? [{ id: 'custom', name: customName, alwaysInclude: true }]
        : []),
    ],
    [customName, name, names],
  );

  const generateDebounced = useMemo(
    () =>
      debounce(
        (value: string) =>
          client.generate.componentNames({ name: value, rect: frame }),
        250,
      ),
    [client, frame],
  );

  useEffect(() => {
    generateDebounced(customName);
  }, [customName, generateDebounced]);

  return (
    <InputFieldWithCompletions
      initialValue={name}
      loading={loading}
      items={completionItems}
      onFocus={async () => setCustomName(name)}
      onChange={(value) => setCustomName(value)}
      onSelectItem={(item) => {
        onChangeName(item.id === 'custom' ? customName : item.name);
      }}
    />
  );
}
