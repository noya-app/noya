import {
  CompletionItem,
  CompletionSectionHeader,
  InputField,
  InputFieldWithCompletions,
  Small,
} from '@noya-app/noya-designsystem';
import { Sketch } from '@noya-app/noya-file-format';
import { useKeyboardShortcuts } from '@noya-app/noya-keymap';
import { debounce } from '@noya-app/noya-utils';
import { useGeneratedComponentNames, useNoyaClient } from 'noya-api';
import { useWorkspace } from 'noya-app-state-context';
import { Model, NoyaNode } from 'noya-component';
import { InspectorPrimitives } from 'noya-inspector';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { primitiveElements } from '../../../dseditor/primitiveElements';
import { useAyonDispatch } from '../../state/ayonState';
import { boxSymbolId } from '../../symbols/symbolIds';
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

  // Track whether the user has manually changed the name.
  // If they haven't, we'll delete the layer when they delete the name.
  const isNameDirtyRef = React.useRef(false);

  useEffect(() => {
    if (isNameDirtyRef.current === false) {
      isNameDirtyRef.current = customName !== '' || name !== '';
    }
  }, [customName, name]);

  const completionItems = useMemo(
    (): (CompletionItem | CompletionSectionHeader)[] => [
      {
        type: 'sectionHeader',
        id: 'design-system',
        name: 'Design System Components',
        maxVisibleItems: 3,
      },
      ...primitiveElements.flatMap((p): CompletionItem[] => [
        {
          id: `primitive:${p.id}:${p.name}`,
          name: p.name,
          icon: p.icon,
        },
        ...(p.aliases ?? []).map((alias) => ({
          id: `primitive:${p.id}:${alias}`,
          name: alias,
          icon: p.icon,
        })),
      ]),
      { type: 'sectionHeader', id: 'create-new', name: 'Create with AI' },
      ...(customName && customName !== name
        ? [{ id: 'custom', name: customName, alwaysInclude: true, icon: '✨' }]
        : []),
      {
        type: 'sectionHeader',
        id: 'generated',
        name: 'Other AI Suggestions',
      },
      ...names.map(
        ({ name }): CompletionItem => ({
          id: name,
          name,
          alwaysInclude: true,
          icon: '✨',
        }),
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
      const parts = item.id.split(':');

      const primitive =
        parts.length === 3 && primitiveElements.find((p) => p.id === parts[1]);

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
          [
            'setLayerDescription',
            selectedLayer.do_objectID,
            primitive.description,
          ],
          [
            'setLayerNode',
            selectedLayer.do_objectID,
            node,
            { name: item.name, description: primitive.description },
          ],
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

  const handleBlur = useCallback(
    (didSubmit: boolean, value: string) => {
      if (!didSubmit) {
        dispatch('setLayerName', selectedLayer.do_objectID, value);
      }
    },
    [dispatch, selectedLayer.do_objectID],
  );

  const handleDeleteWhenEmpty = useCallback(() => {
    if (isNameDirtyRef.current) return;

    if (
      !selectedLayer.data.description &&
      (!selectedLayer.data.node || isBoxWithNoChildren(selectedLayer.data.node))
    ) {
      dispatch('deleteLayer', selectedLayer.do_objectID);
    }
  }, [
    dispatch,
    selectedLayer.data.description,
    selectedLayer.data.node,
    selectedLayer.do_objectID,
  ]);

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
        onDeleteWhenEmpty={handleDeleteWhenEmpty}
        hideChildrenWhenFocused
        onBlur={handleBlur}
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

function isBoxWithNoChildren(node: NoyaNode) {
  return (
    node.type === 'noyaPrimitiveElement' &&
    node.children.length === 0 &&
    node.componentID === boxSymbolId
  );
}
