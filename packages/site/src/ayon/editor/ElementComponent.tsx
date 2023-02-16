import React from 'react';
import {
  DefaultElement,
  RenderElementProps,
  useFocused,
  useSelected,
} from 'slate-react';

export function ElementComponent(props: RenderElementProps) {
  const selected = useSelected();
  const focused = useFocused();

  if (focused && props.element.label) {
    return (
      <div
        style={{
          background: selected ? 'white' : 'rgba(0,0,0,0.05)',
          border: `1px solid ${selected ? 'black' : 'transparent'}`,
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'end',
        }}
      >
        <div style={{ flex: '1' }}>
          <DefaultElement {...props} />
        </div>
        <span
          contentEditable={false}
          style={{
            color: 'rgba(0,0,0,0.4)',
            userSelect: 'none',
            // TODO: Click should focus the end of the line
            pointerEvents: 'none',
          }}
        >
          {props.element.label}
        </span>
      </div>
    );
  }

  return <DefaultElement {...props} />;
}
