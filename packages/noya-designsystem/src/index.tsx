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
export * from './components/Button';
export * from './components/IconButton';
export * from './components/Label';
export * from './components/Select';
export * from './components/FillInputField';
export * from './components/FillPreviewBackground';
export * from './components/LabeledElementView';
export * from './components/Slider';
export * from './components/TreeView';
export * from './components/Divider';
export * from './components/ColorPicker';
export * from './components/GradientPicker';
export * from './components/ListView';
export * from './components/Grid';
export * from './components/GridView';
export * from './components/Sortable';
export type { RelativeDropPosition } from './components/Sortable';
export * from './components/InputField';
export * from './components/RadioGroup';
export * from './components/Spacer';
export * from './components/Dialog';
export * from './components/Tooltip';
export * from './components/ContextMenu';
export * from './components/DropdownMenu';
export * from './components/ScrollArea';
export * from './components/Stack';
export * from './components/Text';
export { SEPARATOR_ITEM } from './components/internal/Menu';
export type { MenuItem, RegularMenuItem } from './components/internal/Menu';

// Contexts
export * from './contexts/GlobalInputBlurContext';
export * from './contexts/DesignSystemConfiguration';
export * from './contexts/DialogContext';

// Hooks
export * from './hooks/mergeEventHandlers';
export * from './hooks/useHover';
export * from './hooks/useModKey';

// Utils
export * from './utils/sketchColor';
export * from './utils/createSectionedMenu';
export * from './utils/getGradientBackground';
export * from './utils/sketchPattern';
export * from './utils/mouseEvent';
export { default as withSeparatorElements } from './utils/withSeparatorElements';
