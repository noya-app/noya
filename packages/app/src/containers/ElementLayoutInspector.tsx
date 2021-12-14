import { useApplicationState } from 'noya-app-state-context';
import { Select } from 'noya-designsystem';
import { useDeepMemo } from 'noya-react-utils';
import {
  createObjectId,
  ElementFlexDirection,
  getElementLayerForObjectPath,
  getSelectedComponentElements,
} from 'noya-state';
import { useTypescriptCompiler } from 'noya-typescript';
import { upperFirst } from 'noya-utils';
import { memo, useCallback } from 'react';
import * as InspectorPrimitives from '../components/inspector/InspectorPrimitives';

export const ElementLayoutInspector = memo(function ElementLayoutInspector() {
  const [state, dispatch] = useApplicationState();
  const compiler = useTypescriptCompiler();
  const objectPath = useDeepMemo(getSelectedComponentElements(state)[0]);
  const elementLayer = getElementLayerForObjectPath(
    compiler.environment,
    objectPath,
  );

  const flexDirection: ElementFlexDirection =
    elementLayer &&
    elementLayer.attributes.flexDirection &&
    elementLayer.attributes.flexDirection.type === 'stringLiteral'
      ? (elementLayer.attributes.flexDirection.value as ElementFlexDirection)
      : 'column';

  return (
    <InspectorPrimitives.Section>
      <InspectorPrimitives.SectionHeader>
        <InspectorPrimitives.Title>Layout</InspectorPrimitives.Title>
      </InspectorPrimitives.SectionHeader>
      <InspectorPrimitives.VerticalSeparator />
      <InspectorPrimitives.LabeledRow label="Direction">
        <Select<ElementFlexDirection>
          id={'element-layout-input'}
          value={flexDirection}
          options={['row', 'column']}
          getTitle={upperFirst}
          onChange={useCallback(
            (value: ElementFlexDirection) => {
              dispatch(
                'setElementFlexDirection',
                createObjectId(objectPath.layerId, objectPath.indexPath),
                value,
              );
            },
            [dispatch, objectPath.indexPath, objectPath.layerId],
          )}
        />
      </InspectorPrimitives.LabeledRow>
    </InspectorPrimitives.Section>
  );
});
