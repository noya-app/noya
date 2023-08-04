import { useGeneratedComponentNames, useNoyaClient } from 'noya-api';
import {
  CompletionItem,
  CompletionSectionHeader,
  InputFieldWithCompletions,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { InspectorPrimitives } from 'noya-inspector';
import { debounce } from 'noya-utils';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useAyonState } from '../../state/ayonState';
import { CustomLayerData } from '../../types';

type Props = {
  selectedLayer: Sketch.CustomLayer<CustomLayerData>;
};

export const ComponentNameInspector = memo(function ComponentNameInspector({
  selectedLayer,
}: Props) {
  const [, dispatch] = useAyonState();

  const name = selectedLayer.name;
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
        (value: string) => client.generate.componentNames({ name: value }),
        250,
      ),
    [client],
  );

  useEffect(() => {
    generateDebounced(customName);
  }, [customName, generateDebounced]);

  const handleChangeName = useCallback(
    (value: string) => {
      dispatch('batch', [
        ['setLayerName', selectedLayer.do_objectID, value],
        ['setLayerDescription', undefined],
        ['setLayerNode', undefined],
      ]);
    },
    [dispatch, selectedLayer.do_objectID],
  );

  return (
    <InspectorPrimitives.LabeledRow label="Name">
      <InputFieldWithCompletions
        initialValue={name}
        loading={loading}
        items={completionItems}
        onFocus={async () => setCustomName(name)}
        onChange={(value) => setCustomName(value)}
        onSelectItem={(item) => {
          handleChangeName(item.id === 'custom' ? customName : item.name);
        }}
      />
    </InspectorPrimitives.LabeledRow>
  );
});
