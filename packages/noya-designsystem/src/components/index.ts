// These types propagate generics through memo and forwardRef to support generic components
//
// https://stackoverflow.com/questions/60386614/how-to-use-props-with-generics-with-react-memo/60389122#60389122
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref/58473012
declare module 'react' {
  function memo<A, B>(
    Component: (props: A) => B,
  ): (props: A) => ReactElement | null;

  function forwardRef<T, P = {}>(
    render: (props: P, ref: ForwardedRef<T>) => ReactElement | null,
  ): (props: P & RefAttributes<T>) => ReactElement | null;
}

export * as ListView from './ListView';
export * as TreeView from './TreeView';
export * from './Layout';
export * from './Button';
export * from './Slider';
export * from './Select';
export * from './Dialog';
export * from './Tooltip';
export * from './Checkbox';
export * from './Touchable';
export * from './InputField';
export * from './Expandable';
export * from './RadioGroup';
export * from './ScrollableView';
export * from './FillInputField';
export * as Label from './Label';
export * as Sortable from './Sortable';
export { default as Popover } from './Popover';
export { default as GridView } from './GridView';
export { default as ScrollArea } from './ScrollArea';
export { default as ContextMenu } from './ContextMenu';
export { default as LabeledView } from './LabeledView';
export { default as ColorPicker } from './ColorPicker';
export { default as DropdownMenu } from './DropdownMenu';
export { default as GradientPicker } from './GradientPicker';
export { default as FillInputField } from './FillInputField';
export type { MenuItem, RegularMenuItem } from './internal/Menu';
export { SEPARATOR_ITEM } from './internal/Menu';
export type { KeyDownParams } from './internal/TextInput';
