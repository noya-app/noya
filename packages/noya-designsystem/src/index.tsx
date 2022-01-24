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
export * from './mediaQuery';

// Components
export { default as Button } from './components/Button';
export { default as IconButton } from './components/IconButton';
export * as Label from './components/Label';
export { default as Select, SelectOption } from './components/Select';
export { default as FillInputField } from './components/FillInputField';
export * from './components/FillPreviewBackground';
export { default as LabeledElementView } from './components/LabeledElementView';
export { default as Slider } from './components/Slider';
export * as TreeView from './components/TreeView';
export { default as Divider } from './components/Divider';
export { default as ColorPicker } from './components/ColorPicker';
export { default as GradientPicker } from './components/GradientPicker';
export * as ListView from './components/ListView';
export { default as Grid } from './components/Grid';
export * as GridView from './components/GridView';
export * as Sortable from './components/Sortable';
export type { RelativeDropPosition } from './components/Sortable';
export * as InputField from './components/InputField';
export * as RadioGroup from './components/RadioGroup';
export * as Spacer from './components/Spacer';
export * from './components/Dialog';
export { default as Tooltip } from './components/Tooltip';
export { default as ContextMenu } from './components/ContextMenu';
export { default as DropdownMenu } from './components/DropdownMenu';
export { default as ScrollArea } from './components/ScrollArea';
export { default as Stack } from './components/Stack';
export { default as Text } from './components/Text';
export { SEPARATOR_ITEM } from './components/internal/Menu';
export type { MenuItem, RegularMenuItem } from './components/internal/Menu';

// Contexts
export * from './contexts/GlobalInputBlurContext';
export * from './contexts/DesignSystemConfiguration';

// Hooks
export * from './hooks/mergeEventHandlers';
export * from './hooks/useHover';
export * from './hooks/useModKey';

// Utils
export * from './utils/createSectionedMenu';
export * from './utils/getGradientBackground';
export * from './utils/sketchPattern';
export * from './utils/mouseEvent';
export { default as withSeparatorElements } from './utils/withSeparatorElements';
