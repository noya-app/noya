import * as kiwi from 'kiwi.js';
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

const Container = styled.div(({ theme }) => ({
  display: 'flex',
  flex: '1',
  flexDirection: 'column',
  position: 'relative',
}));

const Tools = styled.div(({ theme }) => ({
  display: 'flex',
  flex: '1',
  alignItems: 'center',
}));

const Labels = styled.div(({ theme }) => ({
  height: 'var(--height)',
  position: 'relative',
  overflow: 'hidden',
  userSelect: 'none',
}));

interface ContainerProps {
  children: ReactNode;
  renderLabel: (provided: { id: string; index: number }) => ReactNode;
}

export const LabeledElementView = memo(function LabeledElementView({
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
  const containerRef = useRef<HTMLDivElement | null>(null);

  const refs = useMemo(() => {
    return Object.fromEntries(
      serializedIds.split(',').map((id) => [id, createRef<HTMLSpanElement>()]),
    );
  }, [serializedIds]);

  const labelElements = useMemo(() => {
    return serializedIds.split(',').map((id, index) => (
      <span
        key={id}
        ref={refs[id]}
        style={{ position: 'absolute', left: `var(--x-offset)` }}
      >
        {renderLabel({
          id,
          index,
        })}
      </span>
    ));
  }, [refs, serializedIds, renderLabel]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();

    const solver = new kiwi.Solver();
    const variables: kiwi.Variable[] = [];
    const heights: number[] = [];

    Object.entries(refs).forEach(([id, ref], index, list) => {
      if (!ref.current) return;

      // console.log('id', id, ref, index);

      const targetElement = document.getElementById(id)!;
      const targetRect = targetElement.getBoundingClientRect();
      targetRect.x = targetElement.offsetLeft;
      const labelRect = ref.current.getBoundingClientRect();
      labelRect.x = ref.current.offsetLeft;

      // console.log(id, labelRect, ref.current.offsetLeft);

      heights.push(labelRect.height);

      const targetMidXValue = targetRect.x + targetRect.width / 2;

      const labelMidX = new kiwi.Variable();
      solver.addEditVariable(labelMidX, kiwi.Strength.weak);
      solver.addConstraint(
        new kiwi.Constraint(
          new kiwi.Expression(labelMidX),
          kiwi.Operator.Eq,
          new kiwi.Expression(targetMidXValue),
          kiwi.Strength.strong,
        ),
      );

      if (index === 0) {
        solver.addConstraint(
          new kiwi.Constraint(
            new kiwi.Expression(labelMidX),
            kiwi.Operator.Ge,
            new kiwi.Expression(labelRect.width / 2),
            kiwi.Strength.required,
          ),
        );
      }

      // if (index > 0) {
      //   solver.addConstraint(
      //     new kiwi.Constraint(
      //       new kiwi.Expression(variables[index - 1]),
      //       kiwi.Operator.Le,
      //       new kiwi.Expression(labelRect.width / 2),
      //       kiwi.Strength.required
      //     )
      //   );
      // }

      if (index === list.length - 1) {
        // console.log(
        //   labelMidX.value(),
        //   containerRect.width,
        //   containerRect.width - labelRect.width / 2,
        // );
        solver.addConstraint(
          new kiwi.Constraint(
            new kiwi.Expression(labelMidX),
            kiwi.Operator.Le,
            new kiwi.Expression(containerRect.width - labelRect.width / 2),
            kiwi.Strength.required,
          ),
        );
      }

      solver.suggestValue(labelMidX, labelRect.x + labelRect.width / 2);

      variables.push(labelMidX);
    });

    solver.updateVariables();

    Object.entries(refs).forEach(([id, ref], index) => {
      if (!ref.current) return;

      // console.log(id, variables[index].value());

      const labelRect = ref.current.getBoundingClientRect();

      ref.current.style.setProperty(
        '--x-offset',
        `${variables[index].value() - labelRect.width / 2}px`,
      );
    });

    containerRef.current.style.setProperty(
      '--height',
      `${Math.max(...heights)}px`,
    );
  }, [refs, labelElements]);

  return (
    <Container ref={containerRef}>
      <Tools>{children}</Tools>
      <Labels>{labelElements}</Labels>
    </Container>
  );
});
