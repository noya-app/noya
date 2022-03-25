import React, {
  Children,
  createRef,
  Fragment,
  isValidElement,
  memo,
  ReactNode,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import styled from 'styled-components';
import { View, Text } from 'react-native';

import { ContainerProps } from './types';

const Container = styled(View)({
  flex: 1,
});

const Tools = styled(View)({
  flex: 1,
  alignItems: 'center',
  flexDirection: 'row',
});

const Labels = styled(View)({
  overflow: 'hidden',
});

export default memo(function LabeledElementView({
  children,
  renderLabel,
}: ContainerProps) {
  const elementIds: string[] = Children.toArray(children)
    .flatMap((child) =>
      isValidElement(child) && child.type === Fragment
        ? (child.props.children as ReactNode[])
        : [child],
    )
    .map((child) =>
      isValidElement(child) && 'id' in child.props ? child.props.id : null,
    )
    .filter((id) => !!id);
  const serializedIds = elementIds.join(',');
  const containerRef = useRef<View | null>(null);

  const refs = useMemo(() => {
    return Object.fromEntries(
      serializedIds.split(',').map((id) => [id, createRef<Text>()]),
    );
  }, [serializedIds]);

  const labelElements = useMemo(() => {
    return serializedIds.split(',').map((id, index) => (
      <Text
        key={id}
        ref={refs[id]}
        style={{ position: 'absolute' /* left: `var(--x-offset)` */ }}
      >
        {renderLabel({
          id,
          index,
        })}
      </Text>
    ));
  }, [refs, serializedIds, renderLabel]);

  useLayoutEffect(() => {
    // TODO: ?
  }, [refs, labelElements]);

  return (
    <Container ref={containerRef}>
      <Tools>{children}</Tools>
      <Labels>{labelElements}</Labels>
    </Container>
  );
});
