import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import styled from 'styled-components';

const Node = styled.div<{ selected: boolean }>`
  padding: 10px 20px;
  border-radius: 5px;
  background: white;
  color: red;
  border: 1px solid ${(props) => (props.selected ? 'black' : 'grey')};

  .react-flow__handle {
    background: blue;
    width: 8px;
    height: 10px;
    border-radius: 3px;
  }
`;

export const ColorNode = memo(function ColorNode({
  data,
  isConnectable,
  selected,
}: NodeProps) {
  return (
    <Node selected={selected}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.info('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <div>
        Custom Color Picker Node: <strong>{data.color}</strong>
      </div>
      <input
        className="nodrag"
        type="color"
        onChange={data.onChange}
        defaultValue={data.color}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ top: 10, background: '#555' }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ bottom: 10, top: 'auto', background: '#555' }}
        isConnectable={isConnectable}
      />
    </Node>
  );
});
