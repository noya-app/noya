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

// Theme
export * from './theme';
export * as lightTheme from './theme/light';
export * as darkTheme from './theme/dark';

// Components
export { default as Button } from './components/Button';
export * as Label from './components/Label';
export { default as Select } from './components/Select';
export { default as TextInput } from './components/TextInput';
export { default as ColorInputField } from './components/ColorInputField';
export { default as LabeledElementView } from './components/LabeledElementView';
export { default as Slider } from './components/Slider';
export * as TreeView from './components/TreeView';
export { default as Divider } from './components/Divider';
export { default as ColorPicker } from './components/ColorPicker';
export * as ListView from './components/ListView';
export * as GridView from './components/GridView';
export * as Sortable from './components/Sortable';
export * as InputField from './components/InputField';
export * as RadioGroup from './components/RadioGroup';
export * as Spacer from './components/Spacer';
export { default as Tooltip } from './components/Tooltip';
export * as ContextMenu from './components/ContextMenu';

// Contexts
export * from './contexts/GlobalInputBlurContext';

// Utils
export * from './utils/sketchColor';
