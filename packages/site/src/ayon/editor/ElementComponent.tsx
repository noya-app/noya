import { EyeNoneIcon, EyeOpenIcon } from 'noya-icons';
import React from 'react';
import { Node } from 'slate';
import {
  DefaultElement,
  RenderElementProps,
  useFocused,
  useSelected,
} from 'slate-react';
import styled from 'styled-components';

const Container = styled.div<{ selected: boolean }>(({ selected }) => ({
  background: selected ? 'white' : 'rgba(0,0,0,0.05)',
  border: `1px solid ${selected ? 'black' : 'transparent'}`,
  padding: '4px 8px',
  display: 'flex',
  alignItems: 'end',
  position: 'relative',

  '&:hover .hide-on-hover': {
    visibility: 'hidden',
  },
  '& .show-on-hover': {
    visibility: 'hidden',
  },
  '&:hover .show-on-hover': {
    visibility: 'visible',
  },
}));

const ComponentMenu = styled.span({
  color: 'rgba(0,0,0,0.4)',
  userSelect: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

const HoverMenu = styled.div({
  position: 'absolute',
  right: 8,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
});

interface Props extends RenderElementProps {
  onSetVisible?: (layerId: string, visible: boolean) => void;
  isVisible: boolean;
  label: string;
  placeholder?: string;
  layerBlockTypes: Record<string, string>;
}

export function ElementComponent(props: Props) {
  const selected = useSelected();
  const focused = useFocused();

  if (focused && !props.element.isRoot) {
    const EyeComponent = props.isVisible ? EyeOpenIcon : EyeNoneIcon;

    return (
      <Container selected={selected}>
        <div style={{ flex: '1', position: 'relative' }}>
          <DefaultElement {...props} />
          {props.placeholder && Node.string(props.element) === '' && (
            <span
              contentEditable={false}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                right: '20px',
                color: 'rgba(0,0,0,0.4)',
                userSelect: 'none',
                pointerEvents: 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {props.placeholder}
            </span>
          )}
        </div>
        <ComponentMenu contentEditable={false}>
          <span
            className="hide-on-hover"
            style={{
              textDecoration: props.isVisible ? undefined : 'line-through',
            }}
          >
            {props.label}
          </span>
          <HoverMenu className="show-on-hover">
            <EyeComponent
              style={{
                color: !props.isVisible ? 'black' : undefined,
                cursor: 'pointer',
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (!props.element.layerPath) return;

                props.onSetVisible?.(
                  props.element.layerPath.join('/'),
                  !props.isVisible,
                );
              }}
            />
          </HoverMenu>
        </ComponentMenu>
      </Container>
    );
  }

  return <DefaultElement {...props} />;
}
