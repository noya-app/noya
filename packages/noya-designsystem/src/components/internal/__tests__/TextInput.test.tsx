import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import TextInput from '../TextInput';

describe('submittable text input', () => {
  test('change and blur', () => {
    let text = '';
    const handleSubmit = (value: string) => {
      text = value;
    };

    const { container, rerender } = render(
      <TextInput value={text} onSubmit={handleSubmit} />,
    );

    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.blur(input);

    expect(text).toEqual('abc');
    expect(input.value).toEqual('');

    rerender(<TextInput value={text} onSubmit={handleSubmit} />);

    expect(input.value).toEqual('abc');
  });

  test('change and blur, reset', () => {
    const handleSubmit = (value: string) => {};

    const { container, rerender } = render(
      <TextInput value="" onSubmit={handleSubmit} />,
    );

    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.blur(input);

    expect(input.value).toEqual('');

    rerender(<TextInput value="def" onSubmit={handleSubmit} />);

    expect(input.value).toEqual('def');
  });

  test('submit without changing', () => {
    const handleSubmit = jest.fn();

    const { container } = render(
      <TextInput value="" onSubmit={handleSubmit} />,
    );

    const input = container.querySelector('input')!;
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleSubmit).not.toBeCalled();
  });

  test('change and submit', () => {
    let text = '';
    const handleSubmit = (value: string) => {
      text = value;
    };

    const { container, rerender } = render(
      <TextInput value={text} onSubmit={handleSubmit} />,
    );

    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(text).toEqual('abc');
    expect(input.value).toEqual('');

    rerender(<TextInput value={text} onSubmit={handleSubmit} />);

    expect(input.value).toEqual('abc');

    fireEvent.change(input, { target: { value: 'abcdef' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(text).toEqual('abcdef');
    expect(input.value).toEqual('abc');

    rerender(<TextInput value={text} onSubmit={handleSubmit} />);

    expect(input.value).toEqual('abcdef');
  });

  test('change and submit, reset', () => {
    const handleSubmit = (value: string) => {};

    const { container, rerender } = render(
      <TextInput value="" onSubmit={handleSubmit} />,
    );

    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(input.value).toEqual('');

    rerender(<TextInput value="" onSubmit={handleSubmit} />);

    expect(input.value).toEqual('');
  });

  test('submit only once', () => {
    const handleSubmit = jest.fn();

    const { container } = render(
      <TextInput value="" onSubmit={handleSubmit} />,
    );

    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleSubmit).toBeCalledTimes(1);
  });

  test('submit multiple times', () => {
    const handleSubmit = jest.fn();

    const { container } = render(
      <TextInput
        value=""
        onSubmit={handleSubmit}
        allowSubmittingWithSameValue
      />,
    );

    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleSubmit).toBeCalledTimes(3);
  });
});
