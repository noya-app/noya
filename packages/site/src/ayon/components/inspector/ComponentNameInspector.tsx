import { useGeneratedComponentNames, useNoyaClient } from 'noya-api';
import { useWorkspace } from 'noya-app-state-context';
import {
  CompletionItem,
  CompletionSectionHeader,
  InputField,
  InputFieldWithCompletions,
  Small,
} from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { InspectorPrimitives } from 'noya-inspector';
import { useKeyboardShortcuts } from 'noya-keymap';
import { debounce } from 'noya-utils';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Model } from '../../../dseditor/builders';
import { primitiveElements } from '../../../dseditor/primitiveElements';
import { useAyonDispatch } from '../../state/ayonState';
import { CustomLayerData } from '../../types';

type Props = {
  selectedLayer: Sketch.CustomLayer<CustomLayerData>;
};

export const ComponentNameInspector = memo(function ComponentNameInspector({
  selectedLayer,
}: Props) {
  const dispatch = useAyonDispatch();
  const client = useNoyaClient();

  const name = selectedLayer.name;
  const { renamingLayer, didHandleFocus } = useWorkspace();
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
      { type: 'sectionHeader', id: 'create-new', name: 'Create with AI' },
      ...(customName && customName !== name
        ? [{ id: 'custom', name: customName, alwaysInclude: true }]
        : []),
      { type: 'sectionHeader', id: 'generated', name: 'Other Suggestions' },
      ...names.map(
        ({ name }): CompletionItem => ({ id: name, name, alwaysInclude: true }),
      ),
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
            classNames: Model.classNames(['flex-1']),
          });

        dispatch('batch', [
          ['setLayerName', selectedLayer.do_objectID, item.name],
          ['setLayerDescription', selectedLayer.do_objectID, ''],
          ['setLayerNode', selectedLayer.do_objectID, node, 'unset'],
        ]);
      } else {
        dispatch('batch', [
          [
            'setLayerName',
            selectedLayer.do_objectID,
            item.id === 'custom' ? customName : item.name,
          ],
          ['setLayerDescription', selectedLayer.do_objectID, undefined],
          ['setLayerNode', selectedLayer.do_objectID, undefined, 'unset'],
        ]);
      }
    },
    [customName, dispatch, selectedLayer.do_objectID],
  );

  const inputRef = React.useRef<HTMLInputElement>(null);

  useKeyboardShortcuts({
    '/': () => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    },
  });

  useEffect(() => {
    if (renamingLayer !== selectedLayer.do_objectID) return;

    didHandleFocus();

    inputRef.current?.focus();
    inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
  }, [didHandleFocus, renamingLayer, selectedLayer.do_objectID]);

  return (
    <InspectorPrimitives.LabeledRow label="Name">
      <InputFieldWithCompletions
        ref={inputRef}
        initialValue={name}
        loading={loading}
        items={completionItems}
        onFocus={() => setCustomName(name)}
        onChange={(value) => setCustomName(value)}
        onSelectItem={handleSelectItem}
        hideChildrenWhenFocused
      >
        <InputField.Button>
          <Small opacity="0.5" fontFamily="monospace">
            /
          </Small>
        </InputField.Button>
      </InputFieldWithCompletions>
    </InspectorPrimitives.LabeledRow>
  );
});
