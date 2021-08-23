import { ScrollArea } from 'noya-designsystem';
import Sketch from 'noya-file-format';
import { memo, useCallback } from 'react';
import styled from 'styled-components';
import ArrayController from './ArrayController';
import { ShaderFillProps } from './FillInputFieldWithPicker';
import * as InspectorPrimitives from './InspectorPrimitives';
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
}));

export default memo(function ShaderInspector({
  id,
  shader,
  onChangeShaderString,
  onAddShaderVariable,
  onDeleteShaderVariable,
  onChangeShaderVariableValue,
  onNudgeShaderVariableValue,
  onChangeShaderVariableName,
}: ShaderFillProps & { id: string }) {
  return (
    <InspectorPrimitives.Row>
      <Sidebar>
        <ScrollArea>
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
