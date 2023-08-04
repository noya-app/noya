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
import { Model } from '../../../dseditor/builders';
import { primitiveElements } from '../../../dseditor/primitiveElements';
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
      {
        type: 'sectionHeader',
        id: 'design-system',
        name: 'Design System',
        maxVisibleItems: 3,
      },
      ...primitiveElements.flatMap((p): CompletionItem[] => [
        {
          id: p.id,
          name: p.name,
          icon: p.icon,
        },
        ...(p.aliases ?? []).map((alias) => ({
          id: p.id,
          name: alias,
          icon: p.icon,
        })),
      ]),
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

  const handleSelectItem = useCallback(
    (item: CompletionItem) => {
      const primitive = primitiveElements.find((p) => p.id === item.id);

      if (primitive) {
        const node =
          primitive.initialValue?.() ??
          Model.primitiveElement({
            name: item.name,
            componentID: primitive.id,
            classNames: ['flex-1'],
          });

        dispatch('batch', [
          ['setLayerName', selectedLayer.do_objectID, item.name],
          ['setLayerDescription', ''],
          ['setLayerNode', node],
        ]);
      } else {
        dispatch('batch', [
          [
            'setLayerName',
            selectedLayer.do_objectID,
            item.id === 'custom' ? customName : item.name,
          ],
          ['setLayerDescription', undefined],
          ['setLayerNode', undefined],
        ]);
      }
    },
    [customName, dispatch, selectedLayer.do_objectID],
  );

  return (
    <InspectorPrimitives.LabeledRow label="Name">
      <InputFieldWithCompletions
        initialValue={name}
        loading={loading}
        items={completionItems}
        onFocus={() => setCustomName(name)}
        onChange={(value) => setCustomName(value)}
        onSelectItem={handleSelectItem}
      />
    </InspectorPrimitives.LabeledRow>
  );
});
