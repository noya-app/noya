import { useNoyaClient } from 'noya-api';
import { CompletionItem, InputFieldWithCompletions } from 'noya-designsystem';
import { Rect } from 'noya-geometry';
import { debounce } from 'noya-utils';
import React, { useCallback, useMemo, useState } from 'react';

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
  const [loading, setLoading] = useState(false);
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
  const [customName, setCustomName] = useState(name);

  const completionItems: CompletionItem[] = useMemo(
    () => [
      ...suggestedNames.map((name) => ({ id: name, name })),
      ...(customName && customName !== name
        ? [{ id: 'custom', name: `Create new: ${customName}` }]
        : []),
    ],
    [customName, name, suggestedNames],
  );

  const generateDebounced = useMemo(
    () =>
      debounce(async (value: string) => {
        const names = await client.networkClient.generate.componentNames({
          name: value,
          rect: frame,
        });

        setSuggestedNames(names.map(({ name }) => name));
        setLoading(false);
      }, 250),
    [client, frame],
  );

  const updateSuggestions = useCallback(
    async (value: string) => {
      setCustomName(value);
      setLoading(true);
      generateDebounced(value);
    },
    [generateDebounced],
  );

  return (
    <InputFieldWithCompletions
      initialValue={name}
      loading={loading}
      items={completionItems}
      onFocus={async () => updateSuggestions(name)}
      onBlur={() => setSuggestedNames([])}
      onChange={(value) => updateSuggestions(value)}
      onSelectItem={(item) => {
        onChangeName(item.id === 'custom' ? customName : item.name);
      }}
    />
  );
}
