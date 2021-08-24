import { ScrollArea, Select } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { useCompileShader } from 'noya-renderer';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import ArrayController from './ArrayController';
import { ShaderFillProps } from './FillInputFieldWithPicker';
import * as InspectorPrimitives from './InspectorPrimitives';
import { PatternFillType } from './PatternInspector';
import { ShaderVariableRow } from './ShaderVariableRow';

const VerticalDivider = styled.div(({ theme }) => ({
  alignSelf: 'stretch',
  background: theme.colors.divider,
  width: '1px',
  margin: '10px 0',
}));

const Sidebar = styled.div(({ theme }) => ({
  width: theme.sizes.sidebarWidth,
  alignSelf: 'stretch',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));

const ErrorSection = styled.div(({ theme }) => ({
  ...theme.textStyles.code,
  background: 'black',
  color: 'red',
  fontWeight: 'bold',
  padding: '4px',
  borderRadius: '4px',
}));

const TextEditor = styled.textarea(({ theme }) => ({
  ...theme.textStyles.code,
  color: theme.colors.text,
  background: theme.colors.inputBackground,
  padding: '4px',
  margin: '10px',
  border: 'none',
  outline: 'none',
  height: 300,
  borderRadius: '4px',
  resize: 'none',
  whiteSpace: 'pre',
}));

export default memo(function ShaderInspector({
  id,
  shader,
  fillType,
  onChangeFillType,
  onChangeShaderString,
  onAddShaderVariable,
  onDeleteShaderVariable,
  onChangeShaderVariableValue,
  onNudgeShaderVariableValue,
  onChangeShaderVariableName,
}: ShaderFillProps & { id: string }) {
  const compiled = useCompileShader(shader);

  // We only compile the shader here to detect errors, so cleanup memory immediately
  compiled.delete();

  return (
    <InspectorPrimitives.Row>
      <Sidebar>
        <ScrollArea>
          <InspectorPrimitives.Section>
            {compiled.type === 'error' && (
              <ErrorSection>{compiled.value}</ErrorSection>
            )}
            <InspectorPrimitives.VerticalSeparator />
            <InspectorPrimitives.SectionHeader>
              <InspectorPrimitives.Title>Settings</InspectorPrimitives.Title>
            </InspectorPrimitives.SectionHeader>
            <InspectorPrimitives.VerticalSeparator />
            <InspectorPrimitives.LabeledRow label={'Size'}>
              <Select<'Fill' | 'Stretch'>
                id={`${id}-resize-mode`}
                value={
                  fillType === Sketch.PatternFillType.Stretch
                    ? 'Stretch'
                    : 'Fill'
                }
                options={useMemo(() => ['Fill', 'Stretch'], [])}
                onChange={useCallback(
                  (value: PatternFillType) => {
                    onChangeFillType(Sketch.PatternFillType[value]);
                  },
                  [onChangeFillType],
                )}
              />
            </InspectorPrimitives.LabeledRow>
          </InspectorPrimitives.Section>
          <ArrayController<Sketch.ShaderVariable>
            id="shader-variables"
            title="Variables"
            items={shader.variables}
            sortable
            renderItem={useCallback(
              ({
                item,
                index,
              }: {
                item: Sketch.ShaderVariable;
                index: number;
              }) => (
                <ShaderVariableRow
                  id={`${id}-${index}`}
                  variable={item}
                  onChangeValue={(value) =>
                    onChangeShaderVariableValue(item.name, value)
                  }
                  onNudge={(value) =>
                    onNudgeShaderVariableValue(item.name, value)
                  }
                  onClickDelete={() => onDeleteShaderVariable(item.name)}
                  onChangeName={(name) =>
                    onChangeShaderVariableName(item.name, name)
                  }
                />
              ),
              [
                id,
                onChangeShaderVariableName,
                onChangeShaderVariableValue,
                onDeleteShaderVariable,
                onNudgeShaderVariableValue,
              ],
            )}
            onClickPlus={onAddShaderVariable}
          />
        </ScrollArea>
      </Sidebar>
      <VerticalDivider />
      <InspectorPrimitives.Column>
        <TextEditor
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          value={shader.shaderString}
          onChange={useCallback(
            (event) => onChangeShaderString(event.target.value),
            [onChangeShaderString],
          )}
        />
      </InspectorPrimitives.Column>
    </InspectorPrimitives.Row>
  );
});
