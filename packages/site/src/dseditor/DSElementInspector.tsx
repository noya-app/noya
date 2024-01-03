import {
  Chip,
  InputField,
  InputFieldWithCompletions,
  Stack,
} from '@noya-app/noya-designsystem';
import { Model, NoyaComponent, NoyaPrimitiveElement } from 'noya-component';
import { InspectorPrimitives } from 'noya-inspector';
import React, { memo, useEffect } from 'react';
import {
  DescriptionTextArea,
  useAutoResize,
} from '../ayon/components/inspector/DescriptionTextArea';
import { InspectorSection } from '../components/InspectorSection';
import { primitiveElementStyleItems, styleItems } from './completionItems';

type Props = {
  component: NoyaComponent;
  onChangeComponent: (component: NoyaComponent) => void;
};

export const DSElementInspector = memo(function DSElementInspector({
  component,
  onChangeComponent,
}: Props) {
  const rootElement = component.rootElement as NoyaPrimitiveElement;
  const styleSearchInputRef = React.useRef<HTMLInputElement>(null);
  const [isSearchingStyles, setIsSearchingStyles] = React.useState(false);
  const descriptionRef = useAutoResize(component.description ?? '');

  useEffect(() => {
    if (isSearchingStyles) {
      styleSearchInputRef.current?.focus();
    }
  }, [isSearchingStyles]);

  return (
    <>
      <InspectorSection title="Element" titleTextStyle="heading3">
        <InspectorPrimitives.LabeledRow label="Name">
          <InputField.Root>
            <InputField.Label>Name</InputField.Label>
            <InputField.Input
              value={component.name}
              disabled
              onChange={() => {}}
            />
          </InputField.Root>
        </InspectorPrimitives.LabeledRow>
        <InspectorPrimitives.LabeledRow label="Description">
          <DescriptionTextArea
            ref={descriptionRef}
            value={component.description}
            onChange={(event) => {
              onChangeComponent({
                ...component,
                description: event.target.value,
              });
            }}
          />
        </InspectorPrimitives.LabeledRow>
      </InspectorSection>
      <InspectorSection title="Styles" titleTextStyle="heading4">
        <InputFieldWithCompletions
          ref={styleSearchInputRef}
          placeholder={'Find style'}
          items={
            primitiveElementStyleItems[rootElement.componentID] ?? styleItems
          }
          onBlur={() => {
            setIsSearchingStyles(false);
          }}
          onSelectItem={(item) => {
            setIsSearchingStyles(false);

            onChangeComponent({
              ...component,
              rootElement: {
                ...rootElement,
                classNames: [
                  ...rootElement.classNames,
                  Model.className(item.name),
                ],
              },
            });
          }}
          style={{
            zIndex: 1, // Focus outline should appear above chips
          }}
        />
        <Stack.H flexWrap="wrap" gap="2px">
          {rootElement.classNames.map(({ value, id }) => {
            const status = undefined;

            return (
              <Chip
                key={id}
                deletable={status !== 'removed'}
                addable={status === 'removed'}
                monospace
                colorScheme={status === 'added' ? 'secondary' : undefined}
                style={{
                  opacity: status === 'removed' ? 0.5 : 1,
                }}
                onDelete={() => {
                  onChangeComponent({
                    ...component,
                    rootElement: {
                      ...rootElement,
                      classNames: rootElement.classNames.filter(
                        (className) => className.id !== id,
                      ),
                    },
                  });
                }}
                // onAdd={() => {
                //   if (rootNode.type !== 'noyaCompositeElement') return;

                //   const newSelection: NoyaCompositeElement = {
                //     ...rootNode,
                //     diff: resetRemovedClassName(
                //       rootNode.diff,
                //       path.slice(1),
                //       value,
                //     ),
                //   };

                //   setDiff(newSelection);
                // }}
              >
                {value}
              </Chip>
            );
          })}
          <Chip
            addable
            monospace
            onAdd={() => {
              if (isSearchingStyles) {
                setIsSearchingStyles(false);
              } else {
                setIsSearchingStyles(true);
              }
            }}
          />
        </Stack.H>
      </InspectorSection>
    </>
  );
});
